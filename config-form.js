/** Upper bounds on number of choices to present. */
const MAX_NUM_OF_OPTIONS = 20;
/**
 * Build widget with instructions on how to use form.
 *
 * @returns {object} card widget
 */
function helpText() {
  return {
    textParagraph: {
      text: 'Enter the poll topic and up to 5 choices in the poll. Blank options will be omitted.',
    },
  };
}
/**
 * Build the text input for a choice.
 *
 * @param {number} index - Index to identify the choice
 * @param {string|undefined} value - Initial value to render (optional)
 * @returns {object} card widget
 */
function optionInput(index, value) {
  return {
    textInput: {
      label: `Option ${index + 1}`,
      type: 'SINGLE_LINE',
      name: `option${index}`,
      value: value || '',
    },
  };
}
/**
 * Build the text input for the poll topic.
 *
 * @param {string|undefined} topic - Initial value to render (optional)
 * @returns {object} card widget
 */
function topicInput(topic) {
  return {
    textInput: {
      label: 'Topic',
      type: 'MULTIPLE_LINE',
      name: 'topic',
      value: topic || '',
    },
  };
}
/**
 * Build the buttons/actions for the form.
 *
 * @returns {object} card widget
 */
function buttons() {
  return {
    buttonList: {
      buttons: [
        {
          text: 'Submit',
          onClick: {
            action: {
              function: 'start_poll',
            },
          },
        },
      ],
    },
  };
}
/**
 * Builds the configuration form.
 *
 * @param {object} options - Initial state to render with form
 * @param {string|undefined} options.topic - Topic of poll (optional)
 * @param {string[]|undefined} options.choices - Text of choices to display to users (optional)
 * @returns {object} card
 */
function buildConfigurationForm(options) {
  const widgets = [];
  widgets.push(helpText());
  widgets.push(topicInput(options.topic));
  for (let i = 0; i < MAX_NUM_OF_OPTIONS; ++i) {
    const choice = options?.choices?.[i];
    widgets.push(optionInput(i, choice));
  }
  widgets.push(buttons());
  // Assemble the card
  return {
    sections: [
      {
        widgets,
      },
    ],
  };
}
exports.MAX_NUM_OF_OPTIONS = MAX_NUM_OF_OPTIONS;
exports.buildConfigurationForm = buildConfigurationForm;