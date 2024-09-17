suite('Digit Grouping', function () {
  const $ = window.test_only_jquery;
  function buildTreeRecursively($el) {
    var tree = {};

    if ($el[0].className) {
      tree.classes = $el[0].className;
    }

    if ($el[0].className.indexOf('mq-cursor') !== -1) {
      tree.classes = 'mq-cursor';
    } else {
      var children = $el.children();
      if (children.length) {
        tree.content = [];
        for (var i = 0; i < children.length; i++) {
          tree.content.push(buildTreeRecursively($(children[i])));
        }
      } else {
        tree.content = $el[0].innerHTML;
      }
    }

    return tree;
  }

  function assertClasses(mq, expected) {
    var $el = $(mq.el());
    var actual = {
      latex: mq.latex(),
      tree: buildTreeRecursively($el.find('.mq-root-block'))
    };

    window.actual = actual;
    assert.equal(
      JSON.stringify(actual, null, 2),
      JSON.stringify(expected, null, 2)
    );
  }

  test('edge cases', function () {
    var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
      enableDigitGrouping: true
    });
    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-empty',
        content: ''
      }
    });

    mq.latex('1\\ ');
    assertClasses(mq, {
      latex: '1\\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('\\ 1');
    assertClasses(mq, {
      latex: '\\ 1',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            classes: 'mq-digit',
            content: '1'
          }
        ]
      }
    });

    mq.latex('\\ 1\\ ');
    assertClasses(mq, {
      latex: '\\ 1\\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('a');
    assertClasses(mq, {
      latex: 'a',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: 'a'
          }
        ]
      }
    });

    mq.latex('a\\ ');
    assertClasses(mq, {
      latex: 'a\\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: 'a'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('\\ a');
    assertClasses(mq, {
      latex: '\\ a',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            content: 'a'
          }
        ]
      }
    });

    mq.latex('a\\ a');
    assertClasses(mq, {
      latex: 'a\\ a',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: 'a'
          },
          {
            content: '&nbsp;'
          },
          {
            content: 'a'
          }
        ]
      }
    });

    mq.latex('\\ a\\ ');
    assertClasses(mq, {
      latex: '\\ a\\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            content: 'a'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('.');
    assertClasses(mq, {
      latex: '.',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '.'
          }
        ]
      }
    });

    mq.latex('.\\ .');
    assertClasses(mq, {
      latex: '.\\ .',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            content: '&nbsp;'
          },
          {
            classes: 'mq-digit',
            content: '.'
          }
        ]
      }
    });

    mq.latex('..');
    assertClasses(mq, {
      latex: '..',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '.'
          }
        ]
      }
    });

    mq.latex('2..');
    assertClasses(mq, {
      latex: '2..',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',

            content: '.'
          }
        ]
      }
    });

    mq.latex('..2');
    assertClasses(mq, {
      latex: '..2',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('\\ \\ ');
    assertClasses(mq, {
      latex: '\\ \\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('\\ \\ \\ ');
    assertClasses(mq, {
      latex: '\\ \\ \\ ',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            content: '&nbsp;'
          },
          {
            content: '&nbsp;'
          },
          {
            content: '&nbsp;'
          }
        ]
      }
    });

    mq.latex('1234');
    assertClasses(mq, {
      latex: '1234',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit mq-group-leading-1',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '4'
          }
        ]
      }
    });
  });

  test('efficient latex updates - grouping enabled', function () {
    var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
      enableDigitGrouping: true
    });
    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-empty',
        content: ''
      }
    });

    mq.latex('.2322');
    assertClasses(mq, {
      latex: '.2322',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '2' },
          { classes: 'mq-digit', content: '3' },
          { classes: 'mq-digit', content: '2' },
          { classes: 'mq-digit', content: '2' }
        ]
      }
    });

    mq.latex('1.2322');
    assertClasses(mq, {
      latex: '1.2322',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('1231.123');
    assertClasses(mq, {
      latex: '1231.123',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit mq-group-leading-1',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          }
        ]
      }
    });

    mq.latex('1231.432');
    assertClasses(mq, {
      latex: '1231.432',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit mq-group-leading-1',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('1231232.432');
    assertClasses(mq, {
      latex: '1231232.432',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit mq-group-leading-1',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('12345...67890');
    assertClasses(mq, {
      latex: '12345...67890',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit', content: '1' },
          { classes: 'mq-digit', content: '2' },
          { classes: 'mq-digit', content: '3' },
          { classes: 'mq-digit', content: '4' },
          { classes: 'mq-digit', content: '5' },
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '6' },
          { classes: 'mq-digit', content: '7' },
          { classes: 'mq-digit', content: '8' },
          { classes: 'mq-digit', content: '9' },
          { classes: 'mq-digit', content: '0' }
        ]
      }
    });
  });

  test('efficient latex updates - grouping and ellipsis enabled', function () {
    var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
      enableDigitGrouping: true,
      tripleDotsAreEllipsis: true
    });
    mq.latex('12345...67890');
    assertClasses(mq, {
      latex: '12345...67890',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit mq-group-leading-2', content: '1' },
          { classes: 'mq-digit mq-group-other', content: '2' },
          { classes: 'mq-digit mq-group-start', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { classes: 'mq-digit mq-group-other', content: '5' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          { classes: 'mq-digit mq-group-leading-2', content: '6' },
          { classes: 'mq-digit mq-group-other', content: '7' },
          { classes: 'mq-digit mq-group-start', content: '8' },
          { classes: 'mq-digit mq-group-other', content: '9' },
          { classes: 'mq-digit mq-group-other', content: '0' }
        ]
      }
    });
    mq.latex('12345....67890');
    assertClasses(mq, {
      latex: '12345....67890',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit mq-group-leading-2', content: '1' },
          { classes: 'mq-digit mq-group-other', content: '2' },
          { classes: 'mq-digit mq-group-start', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { classes: 'mq-digit mq-group-other', content: '5' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          // The remaining digits are after the decimal point, so they don't group
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '6' },
          { classes: 'mq-digit', content: '7' },
          { classes: 'mq-digit', content: '8' },
          { classes: 'mq-digit', content: '9' },
          { classes: 'mq-digit', content: '0' }
        ]
      }
    });
    mq.latex('1...\\ 6789');
    assertClasses(mq, {
      latex: '1...\\ 6789',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit', content: '1' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          { content: '&nbsp;' },
          { classes: 'mq-digit mq-group-leading-1', content: '6' },
          { classes: 'mq-digit mq-group-start', content: '7' },
          { classes: 'mq-digit mq-group-other', content: '8' },
          { classes: 'mq-digit mq-group-other', content: '9' }
        ]
      }
    });
    mq.latex('12345.\\ ..6789');
    assertClasses(mq, {
      latex: '12345.\\ ..6789',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit', content: '1' },
          { classes: 'mq-digit', content: '2' },
          { classes: 'mq-digit', content: '3' },
          { classes: 'mq-digit', content: '4' },
          { classes: 'mq-digit', content: '5' },
          { classes: 'mq-digit', content: '.' },
          { content: '&nbsp;' },
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '.' },
          { classes: 'mq-digit', content: '6' },
          { classes: 'mq-digit', content: '7' },
          { classes: 'mq-digit', content: '8' },
          { classes: 'mq-digit', content: '9' }
        ]
      }
    });
    const n6789_2345 = [
      { classes: 'mq-digit mq-group-leading-1', content: '6' },
      { classes: 'mq-digit mq-group-start', content: '7' },
      { classes: 'mq-digit mq-group-other', content: '8' },
      { classes: 'mq-digit mq-group-other', content: '9' },
      { classes: 'mq-digit', content: '.' },
      { classes: 'mq-digit', content: '2' },
      { classes: 'mq-digit', content: '3' },
      { classes: 'mq-digit', content: '4' },
      { classes: 'mq-digit', content: '5' }
    ];
    mq.latex('1...6789.2345');
    assertClasses(mq, {
      latex: '1...6789.2345',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit', content: '1' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          ...n6789_2345
        ]
      }
    });
    mq.latex('6789.2345...6789.2345');
    assertClasses(mq, {
      latex: '6789.2345...6789.2345',
      tree: {
        classes: 'mq-root-block',
        content: [
          ...n6789_2345,
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          ...n6789_2345
        ]
      }
    });
    mq.latex('6789.2345...6789');
    assertClasses(mq, {
      latex: '6789.2345...6789',
      tree: {
        classes: 'mq-root-block',
        content: [
          ...n6789_2345,
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          { classes: 'mq-digit mq-group-leading-1', content: '6' },
          { classes: 'mq-digit mq-group-start', content: '7' },
          { classes: 'mq-digit mq-group-other', content: '8' },
          { classes: 'mq-digit mq-group-other', content: '9' }
        ]
      }
    });
    mq.latex('12345...67890...12345');
    assertClasses(mq, {
      latex: '12345...67890...12345',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit mq-group-leading-2', content: '1' },
          { classes: 'mq-digit mq-group-other', content: '2' },
          { classes: 'mq-digit mq-group-start', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { classes: 'mq-digit mq-group-other', content: '5' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          { classes: 'mq-digit mq-group-leading-2', content: '6' },
          { classes: 'mq-digit mq-group-other', content: '7' },
          { classes: 'mq-digit mq-group-start', content: '8' },
          { classes: 'mq-digit mq-group-other', content: '9' },
          { classes: 'mq-digit mq-group-other', content: '0' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' },
          { classes: 'mq-digit mq-group-leading-2', content: '1' },
          { classes: 'mq-digit mq-group-other', content: '2' },
          { classes: 'mq-digit mq-group-start', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { classes: 'mq-digit mq-group-other', content: '5' }
        ]
      }
    });
  });

  test('Digit spacing with non-digit before ellipsis', function () {
    var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
      enableDigitGrouping: true,
      tripleDotsAreEllipsis: true
    });
    mq.latex('1234-...');
    assertClasses(mq, {
      latex: '1234-...',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit mq-group-leading-1', content: '1' },
          { classes: 'mq-digit mq-group-start', content: '2' },
          { classes: 'mq-digit mq-group-other', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { classes: 'mq-binary-operator', content: '−' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' }
        ]
      }
    });
    mq.latex('1234,\\ ...');
    assertClasses(mq, {
      latex: '1234,\\ ...',
      tree: {
        classes: 'mq-root-block',
        content: [
          { classes: 'mq-digit mq-group-leading-1', content: '1' },
          { classes: 'mq-digit mq-group-start', content: '2' },
          { classes: 'mq-digit mq-group-other', content: '3' },
          { classes: 'mq-digit mq-group-other', content: '4' },
          { content: ',' },
          { content: '&nbsp;' },
          { classes: 'mq-digit mq-ellipsis-start', content: '.' },
          { classes: 'mq-digit mq-ellipsis-middle', content: '.' },
          { classes: 'mq-digit mq-ellipsis-end', content: '.' }
        ]
      }
    });
  });

  test('efficient latex updates - grouping disabled', function () {
    var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-empty',
        content: ''
      }
    });

    mq.latex('1.2322');
    assertClasses(mq, {
      latex: '1.2322',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('1231.123');
    assertClasses(mq, {
      latex: '1231.123',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          }
        ]
      }
    });

    mq.latex('1231.432');
    assertClasses(mq, {
      latex: '1231.432',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });

    mq.latex('1231232.432');
    assertClasses(mq, {
      latex: '1231232.432',
      tree: {
        classes: 'mq-root-block',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '.'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '2'
          }
        ]
      }
    });
  });

  test('edits ignored if digit grouping disabled', function (done) {
    var mq = MQ.MathField(
      $('<span style="width: 400px; display:inline-block"></span>').appendTo(
        '#mock'
      )[0]
    );

    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-empty',
        content: ''
      }
    });

    $(mq.el()).find('textarea').focus();
    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-hasCursor',
        content: [
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('1');
    assertClasses(mq, {
      latex: '1',
      tree: {
        classes: 'mq-root-block mq-hasCursor',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('2');
    mq.typedText('3');
    mq.typedText('4');
    assertClasses(mq, {
      latex: '1234',
      tree: {
        classes: 'mq-root-block mq-hasCursor',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('5');
    assertClasses(mq, {
      latex: '12345',
      tree: {
        classes: 'mq-root-block mq-hasCursor',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-digit',
            content: '2'
          },
          {
            classes: 'mq-digit',
            content: '3'
          },
          {
            classes: 'mq-digit',
            content: '4'
          },
          {
            classes: 'mq-digit',
            content: '5'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    setTimeout(function () {
      assertClasses(mq, {
        latex: '12345',
        tree: {
          classes: 'mq-root-block mq-hasCursor',
          content: [
            {
              classes: 'mq-digit',
              content: '1'
            },
            {
              classes: 'mq-digit',
              content: '2'
            },
            {
              classes: 'mq-digit',
              content: '3'
            },
            {
              classes: 'mq-digit',
              content: '4'
            },
            {
              classes: 'mq-digit',
              content: '5'
            },
            {
              classes: 'mq-cursor'
            }
          ]
        }
      });

      mq.keystroke('Left');
      assertClasses(mq, {
        latex: '12345',
        tree: {
          classes: 'mq-root-block mq-hasCursor',
          content: [
            {
              classes: 'mq-digit',
              content: '1'
            },
            {
              classes: 'mq-digit',
              content: '2'
            },
            {
              classes: 'mq-digit',
              content: '3'
            },
            {
              classes: 'mq-digit',
              content: '4'
            },
            {
              classes: 'mq-cursor'
            },
            {
              classes: 'mq-digit',
              content: '5'
            }
          ]
        }
      });

      mq.keystroke('Backspace');
      assertClasses(mq, {
        latex: '1235',
        tree: {
          classes: 'mq-root-block mq-hasCursor',
          content: [
            {
              classes: 'mq-digit',
              content: '1'
            },
            {
              classes: 'mq-digit',
              content: '2'
            },
            {
              classes: 'mq-digit',
              content: '3'
            },
            {
              classes: 'mq-cursor'
            },
            {
              classes: 'mq-digit',
              content: '5'
            }
          ]
        }
      });

      $(mq.el()).find('textarea').blur();
      setTimeout(function () {
        assertClasses(mq, {
          latex: '1235',
          tree: {
            classes: 'mq-root-block',
            content: [
              {
                classes: 'mq-digit',
                content: '1'
              },
              {
                classes: 'mq-digit',
                content: '2'
              },
              {
                classes: 'mq-digit',
                content: '3'
              },
              {
                classes: 'mq-digit',
                content: '5'
              }
            ]
          }
        });
        done();
      }, 1);
    }, 1100); // should stop suppressing grouping after 1000ms
  });

  test('edits suppress digit grouping', function (done) {
    var mq = MQ.MathField(
      $('<span style="width: 400px; display:inline-block"></span>').appendTo(
        '#mock'
      )[0],
      { enableDigitGrouping: true }
    );

    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-empty',
        content: ''
      }
    });

    $(mq.el()).find('textarea').focus();
    assertClasses(mq, {
      latex: '',
      tree: {
        classes: 'mq-root-block mq-hasCursor',
        content: [
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('1');
    assertClasses(mq, {
      latex: '1',
      tree: {
        classes: 'mq-root-block mq-hasCursor mq-suppress-grouping',
        content: [
          {
            classes: 'mq-digit',
            content: '1'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('2');
    mq.typedText('3');
    mq.typedText('4');
    assertClasses(mq, {
      latex: '1234',
      tree: {
        classes: 'mq-root-block mq-hasCursor mq-suppress-grouping',
        content: [
          {
            classes: 'mq-digit mq-group-leading-1',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '4'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    mq.typedText('5');
    assertClasses(mq, {
      latex: '12345',
      tree: {
        classes: 'mq-root-block mq-hasCursor mq-suppress-grouping',
        content: [
          {
            classes: 'mq-digit mq-group-leading-2',
            content: '1'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '2'
          },
          {
            classes: 'mq-digit mq-group-start',
            content: '3'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '4'
          },
          {
            classes: 'mq-digit mq-group-other',
            content: '5'
          },
          {
            classes: 'mq-cursor'
          }
        ]
      }
    });

    setTimeout(function () {
      assertClasses(mq, {
        latex: '12345',
        tree: {
          classes: 'mq-root-block mq-hasCursor',
          content: [
            {
              classes: 'mq-digit mq-group-leading-2',
              content: '1'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '2'
            },
            {
              classes: 'mq-digit mq-group-start',
              content: '3'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '4'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '5'
            },
            {
              classes: 'mq-cursor'
            }
          ]
        }
      });

      mq.keystroke('Left');
      assertClasses(mq, {
        latex: '12345',
        tree: {
          classes: 'mq-root-block mq-hasCursor',
          content: [
            {
              classes: 'mq-digit mq-group-leading-2',
              content: '1'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '2'
            },
            {
              classes: 'mq-digit mq-group-start',
              content: '3'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '4'
            },
            {
              classes: 'mq-cursor'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '5'
            }
          ]
        }
      });

      mq.keystroke('Backspace');
      assertClasses(mq, {
        latex: '1235',
        tree: {
          classes: 'mq-root-block mq-hasCursor mq-suppress-grouping',
          content: [
            {
              classes: 'mq-digit mq-group-leading-1',
              content: '1'
            },
            {
              classes: 'mq-digit mq-group-start',
              content: '2'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '3'
            },
            {
              classes: 'mq-cursor'
            },
            {
              classes: 'mq-digit mq-group-other',
              content: '5'
            }
          ]
        }
      });

      $(mq.el()).find('textarea').blur();
      setTimeout(function () {
        assertClasses(mq, {
          latex: '1235',
          tree: {
            classes: 'mq-root-block',
            content: [
              {
                classes: 'mq-digit mq-group-leading-1',
                content: '1'
              },
              {
                classes: 'mq-digit mq-group-start',
                content: '2'
              },
              {
                classes: 'mq-digit mq-group-other',
                content: '3'
              },
              {
                classes: 'mq-digit mq-group-other',
                content: '5'
              }
            ]
          }
        });
        done();
      }, 1);
    }, 1100); // should stop suppressing grouping after 1000ms
  });
});
