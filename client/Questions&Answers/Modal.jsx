import React from 'react';
import PropTypes from 'prop-types';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalView: false,
      body: '',
      name: '',
      email: '',
      photos: [],
      question: false,
      answer: false,
    }
    this.toggleModal = this.toggleModal.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  handleFormChange(e) {
    this.setState({
       [e.target.name]: e.target.value
      })
  }

  submitForm(e) {
    const {name, body, email, photos, answer } = this.state
    const { handleInput, id } = this.props
    const input = ( answer ? {name, body, email, photos} : {name, body, email, id})

    e.preventDefault()

    if (answer)
    { handleInput('answers', id, input) }
    else
    { handleInput('questions', id, input) }

    this.setState({
      body: '',
      name: '',
      email: '',
      photos: [],
    })
    this.toggleModal()
  }

  toggleModal() {
    const { modalView, question, answer } = this.state
    const { type } = this.props
    console.log('toggle modal triggered')
    if (type === 'question') {
      this.setState({
        question: !question
      })
    }
    if (type === 'answer') {
      this.setState({
        answer: !answer
      })
    }
    this.setState(() => {return { modalView: !modalView }})
  }

  render() {
    const { modalView, question } = this.state
    const { productName, buttonText, qText } = this.props
    const areaText = (question ? 'Question: ' : 'Answer: ')
    const titleText = (question ? 'Ask Your Question' : 'Submit Your Answer')
    const subtitleText = (question? 'About the Product: ' : `${productName}: ${qText}`)

    return (
      <>
        <div
          className="open-modal"
          onClick={() => {this.toggleModal()}}
          role="button"
          tabIndex={0}
          onKeyPress={() => {this.toggleModal()}}
        >
          {buttonText}
        </div>
        {modalView && (
        <div className="qa-modal-view">
          <h3>{titleText}</h3>
          <p>
            <strong>{subtitleText}</strong>
            {question && productName}
          </p>
          <div className="modal-form">
            <form
              onSubmit={(e) => {this.submitForm(e)}}
              name="qa"
            >
              <div>
                <label htmlFor="nickname">
                  Nickname:
                  <input
                    required
                    type="text"
                    name="name"
                    maxLength="60"
                    placeholder="Example: jackson11!"
                    onChange={(e) => {this.handleFormChange(e)}}
                  />
                </label>
                <span className="small">For privacy reasons, do not use your full name or email address.</span>
              </div>
              <br />
              <label htmlFor="email">
                E-mail:
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Example: someone@gmail.com"
                  maxLength="60"
                  onChange={(e) => {this.handleFormChange(e)}}
                />
              </label>

              <span className="small">For authentication reasons you will not be e-mailed.</span>
              <br />
              <br />
              <label htmlFor={areaText}>
                {areaText}
                <br />
                <input
                  type="textarea"
                  required
                  name="body"
                  rows="20"
                  maxLength="1000"
                  onChange={(e) => {this.handleFormChange(e)}}
                />
              </label>
              <br />
              <button type="submit">Submit</button>
              <br />
            </form>
          </div>
          <div
            className="qa-close-modal"
            onClick={() => {this.toggleModal()}}
            role="button"
            tabIndex={0}
            onKeyPress={() => {this.toggleModal()}}
          >
            CLOSE
          </div>
        </div>
        )}
      </>
    );
  }
}

export default Modal;

Modal.propTypes = {
  handleInput: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  qText: PropTypes.string.isRequired,
}
