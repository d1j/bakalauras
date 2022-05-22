import React, { Component } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

const emtpyFieldMsgs = {
  username: "",
  email: "",
  password: "",
  password2: "",
  success: "",
};

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldMsgs: { ...emtpyFieldMsgs },
      passwordType: "password",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
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

  async handleSubmit(e) {
    e.preventDefault();
    this.setMsgs();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    if (data.password !== data.password2) {
      this.setMsgs({ password2: "Passwords do not match." });
      return;
    }
    try {
      const response = await API.post("/auth/register/", data);
      console.log(response.data);
      this.setMsgs({ success: "User registerd successfully!" });
    } catch (error) {
      console.log(error.response);
      this.setMsgs(error.response.data);
    }
  }

  handleChange() {
    let passwordType = this.state.passwordType === "password" ? "text" : "password";
    this.setState({ passwordType });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Register</h3>
        <div className="form-group">
          <label>Username</label>
          <input type="text" className="form-control" placeholder="Enter username" name="username" required />
          {this.state.fieldMsgs.username && <p className="errMsgBox">{this.state.fieldMsgs.username}</p>}
        </div>
        <div className="form-group">
          <label>Email address</label>
          <input type="email" className="form-control" placeholder="Enter email" name="email" required />
          {this.state.fieldMsgs.email && <p className="errMsgBox">{this.state.fieldMsgs.email}</p>}
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
          {this.state.fieldMsgs.password && <p className="errMsgBox">{this.state.fieldMsgs.password}</p>}
        </div>
        <div className="form-group">
          <label>Confirm password</label>
          <input
            type={this.state.passwordType}
            className="form-control"
            placeholder="Confirm password"
            name="password2"
            required
          />
          {this.state.fieldMsgs.password2 && <p className="errMsgBox">{this.state.fieldMsgs.password2}</p>}
        </div>
        <div className="form-group">
          <div className="custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="customCheck2" onChange={this.handleChange} />
            <label className="custom-control-label" htmlFor="customCheck2">
              Show password
            </label>
          </div>
        </div>
        {this.state.fieldMsgs.success && <p className="successMsgBox">{this.state.fieldMsgs.success}</p>}
        <button type="submit" className="btn btn-primary btn-block">
          Register
        </button>
        <p className="forgot-password text-right">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    );
  }
}
