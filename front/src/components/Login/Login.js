import React, { Component } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

const emtpyFieldMsgs = {
  error: "",
  success: "",
};

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordType: "password",
      fieldMsgs: { ...emtpyFieldMsgs },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setMsgs = this.setMsgs.bind(this);
  }

  setMsgs(newMsgs = { ...emtpyFieldMsgs }) {
    this.setState((prevState) => ({
      fieldMsgs: {
        ...prevState.fieldMsgs,
        ...newMsgs,
      },
    }));
  }

  handleChange() {
    let passwordType = this.state.passwordType === "password" ? "text" : "password";
    this.setState({ passwordType });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setMsgs();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    try {
      const response = await API.post("/auth/login/", data);
      this.setMsgs({ success: "Logged in successfully! You will be soon redirected." });
      setTimeout(() => {
        this.props.setToken(response.data.access);
      }, 1000);
    } catch (error) {
      console.log(error.response);
      this.setMsgs({ error: error.response.data.detail });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Log in</h3>
        <div className="form-group">
          <label>Username</label>
          <input type="text" className="form-control" placeholder="Enter username" name="username" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type={this.state.passwordType}
            className="form-control"
            placeholder="Enter password"
            name="password"
            required
          />
        </div>
        <div className="form-group">
          <div className="custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="customCheck1" onChange={this.handleChange} />
            <label className="custom-control-label" htmlFor="customCheck1">
              Show password
            </label>
          </div>
        </div>
        {this.state.fieldMsgs.error && <p className="errMsgBox">{this.state.fieldMsgs.error}</p>}
        {this.state.fieldMsgs.success && <p className="successMsgBox">{this.state.fieldMsgs.success}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          Submit
        </button>
        <p className="forgot-password text-right">
          Not a member? <Link to="/register"> Register</Link>
        </p>
      </form>
    );
  }
}
