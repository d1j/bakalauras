import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom";

import "./App.css";

import Command from "./components/Command/Command";
import CommandList from "./components/Command/CommandList";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Schedule from "./components/Schedule/Schedule";
import ScheduleList from "./components/Schedule/ScheduleList";
import useToken from "./components/App/useToken";
import CommandResultsList from "./components/Results/CommandResultsList";

function App() {
  const { token, setToken } = useToken();

  if (!token) {
    return (
      <BrowserRouter>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-light fixed-top">
            <div className="container">
              <Link className="navbar-brand" to={"/login"}>
                Web Scraper
              </Link>
              <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to={"/login"}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={"/register"}>
                      Register
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <div className="auth-wrapper">
            <div className="auth-inner">
              <Routes>
                <Route exact path="/" element={<Login setToken={setToken} />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate replace to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  } else {
    return (
      <BrowserRouter>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-light top">
            <div className="container">
              <Link className="navbar-brand" to={"/schedule"}>
                Web Scraper
              </Link>
              <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to={"/schedule?page=1&pageSize=10"}>
                      Schedules
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={{}}
                      onClick={() => {
                        setToken("");
                      }}
                    >
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <div className="auth-wrapper">
            <div className="auth-inner">
              <Routes>
                <Route path="/schedule" element={<ScheduleList />} />
                <Route path="/schedule/:sched_id" element={<Schedule />} />
                <Route path="/command/:sched_id" element={<CommandList />} />
                <Route path="/command/:sched_id/:comm_id" element={<Command />} />
                <Route path="/command/:sched_id/:comm_id/results" element={<CommandResultsList />} />
                <Route path="*" element={<Navigate replace to="/schedule" />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;

// https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications

// https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
