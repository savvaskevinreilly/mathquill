/*********************************************
 * Manage the MathQuill instance's textarea
 * (as owned by the Controller)
 ********************************************/
Options.prototype.substituteTextarea = function (tabbable?: boolean) {
  return h('textarea', {
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: false,
    'x-palm-disable-ste-all': true,
    tabindex: tabbable ? undefined : '-1'
  });
};
function defaultSubstituteKeyboardEvents(jq: $, controller: Controller) {
  return saneKeyboardEvents(jq[0] as HTMLTextAreaElement, controller);
}
Options.prototype.substituteKeyboardEvents = defaultSubstituteKeyboardEvents;

class Controller extends Controller_scrollHoriz {
  selectFn: (text: string) => void = noop;

  createTextarea() {
    this.textareaSpan = h('span', { class: 'mq-textarea' });

    const tabbable =
      this.options.tabbable !== undefined
        ? this.options.tabbable
        : this.KIND_OF_MQ !== 'StaticMath';

    const textarea = this.options.substituteTextarea(tabbable);
    if (!textarea.nodeType) {
      throw 'substituteTextarea() must return a DOM element, got ' + textarea;
    }
    this.textarea = domFrag(textarea)
      .appendTo(this.textareaSpan)
      .oneElement() as HTMLTextAreaElement;

    var ctrlr = this;
    ctrlr.cursor.selectionChanged = function () {
      ctrlr.selectionChanged();
    };
  }

  selectionChanged() {
    var ctrlr = this;

    // throttle calls to setTextareaSelection(), because setting textarea.value
    // and/or calling textarea.select() can have anomalously bad performance:
    // https://github.com/mathquill/mathquill/issues/43#issuecomment-1399080
    //
    // Note, this timeout may be cleared by the blur handler in focusBlur.js
    if (!ctrlr.textareaSelectionTimeout) {
      ctrlr.textareaSelectionTimeout = setTimeout(function () {
        ctrlr.setTextareaSelection();
      });
    }
  }

  setTextareaSelection() {
    this.textareaSelectionTimeout = 0;
    var latex = '';
    if (this.cursor.selection) {
      //cleanLatex prunes unnecessary spaces. defined in latex.js
      latex = this.cleanLatex(this.cursor.selection.join('latex'));
      if (this.options.statelessClipboard) {
        // FIXME: like paste, only this works for math fields; should ask parent
        latex = '$' + latex + '$';
      }
    }
    this.selectFn(latex);
  }

  staticMathTextareaEvents() {
    var ctrlr = this;
    this.removeTextareaEventListener('cut');
    this.removeTextareaEventListener('paste');
    if (ctrlr.options.disableCopyPaste) {
      this.removeTextareaEventListener('copy');
    } else {
      this.addTextareaEventListeners({
        copy: function () {
          ctrlr.setTextareaSelection();
        }
      });
    }

    this.addStaticFocusBlurListeners();

    ctrlr.selectFn = function (text: string) {
      const textarea = ctrlr.getTextareaOrThrow();
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      textarea.value = text;
      if (text) textarea.select();
    };
  }

  editablesTextareaEvents() {
    var ctrlr = this;
    const textarea = ctrlr.getTextareaOrThrow();
    const textareaSpan = ctrlr.getTextareaSpanOrThrow();

    if (this.options.version < 3) {
      const $ = this.options.assertJquery();
      var keyboardEventsShim = this.options.substituteKeyboardEvents(
        $(textarea),
        this
      );
      this.selectFn = function (text: string) {
        keyboardEventsShim.select(text);
      };
    } else {
      const { select } = saneKeyboardEvents(textarea, this);
      this.selectFn = select;
    }

    domFrag(this.container).prepend(domFrag(textareaSpan));
    this.addEditableFocusBlurListeners();
    this.updateMathspeak();
  }
  unbindEditablesEvents() {
    var ctrlr = this;
    const textarea = ctrlr.getTextareaOrThrow();
    const textareaSpan = ctrlr.getTextareaSpanOrThrow();

    this.selectFn = function (text: string) {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      textarea.value = text;
      if (text) textarea.select();
    };
    domFrag(textareaSpan).remove();

    this.removeTextareaEventListener('focus');
    this.removeTextareaEventListener('blur');

    ctrlr.blurred = true;
    this.removeTextareaEventListener('cut');
    this.removeTextareaEventListener('paste');
  }
  typedText(ch: string) {
    if (ch === '\n') return this.handle('enter');
    var cursor = this.notify(undefined).cursor;
    cursor.parent.write(cursor, ch);
    this.scrollHoriz();
  }
  cut() {
    var ctrlr = this,
      cursor = ctrlr.cursor;
    if (cursor.selection) {
      setTimeout(function () {
        ctrlr.notify('edit'); // deletes selection if present
        cursor.parent.bubble(function (node) {
          (node as MQNode).reflow();
          return undefined;
        });
        if (ctrlr.options && ctrlr.options.onCut) {
          ctrlr.options.onCut();
        }
      });
    }
  }
  copy() {
    this.setTextareaSelection();
  }
  paste(text: string) {
    // TODO: document `statelessClipboard` config option in README, after
    // making it work like it should, that is, in both text and math mode
    // (currently only works in math fields, so worse than pointless, it
    //  only gets in the way by \text{}-ifying pasted stuff and $-ifying
    //  cut/copied LaTeX)
    if (this.options.statelessClipboard) {
      if (text.slice(0, 1) === '$' && text.slice(-1) === '$') {
        text = text.slice(1, -1);
      } else {
        text = '\\text{' + text + '}';
      }
    }
    // FIXME: this always inserts math or a TextBlock, even in a RootTextBlock
    this.writeLatex(text).cursor.show();
    this.scrollHoriz();
    if (this.options && this.options.onPaste) {
      this.options.onPaste();
    }
  }

  /** Set up for a static MQ field (i.e., create and attach the mathspeak element and initialize the focus state to blurred) */
  setupStaticField() {
    this.mathspeakSpan = h('span', { class: 'mq-mathspeak' });
    domFrag(this.container).prepend(domFrag(this.mathspeakSpan));
    domFrag(this.container).prepend(domFrag(this.textareaSpan));
    this.updateMathspeak();
    this.blurred = true;
    this.cursor.hide().parent.blur(this.cursor);
  }

  updateMathspeak() {
    var ctrlr = this;
    // If the controller's ARIA label doesn't end with a punctuation mark, add a colon by default to better separate it from mathspeak.
    var ariaLabel = ctrlr.getAriaLabel();
    var labelWithSuffix = /[A-Za-z0-9]$/.test(ariaLabel)
      ? ariaLabel + ':'
      : ariaLabel;
    var mathspeak = ctrlr.root.mathspeak().trim();
    this.aria.clear();

    const textarea = ctrlr.getTextareaOrThrow();
    // For static math, provide mathspeak in a visually hidden span to allow screen readers and other AT to traverse the content.
    // For editable math, assign the mathspeak to the textarea's ARIA label (AT can use text navigation to interrogate the content).
    // Be certain to include the mathspeak for only one of these, though, as we don't want to include outdated labels if a field's editable state changes.
    // By design, also take careful note that the ariaPostLabel is meant to exist only for editable math (e.g. to serve as an evaluation or error message)
    // so it is not included for static math mathspeak calculations.
    // The mathspeakSpan should exist only for static math, so we use its presence to decide which approach to take.
    if (!!ctrlr.mathspeakSpan) {
      textarea.setAttribute('aria-label', '');
      ctrlr.mathspeakSpan.textContent = (
        labelWithSuffix +
        ' ' +
        mathspeak
      ).trim();
    } else {
      textarea.setAttribute(
        'aria-label',
        (labelWithSuffix + ' ' + mathspeak + ' ' + ctrlr.ariaPostLabel).trim()
      );
    }
  }
}
