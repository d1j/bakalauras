import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { commandService } from "../api";
import { Button, Col, Form, Row } from "react-bootstrap";

const defaultMsgs = { success: "", error: "" };

export default function Command() {
  const [failedRequest, setFailedRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const [systemData, setSystemData] = useState({});
  const [msgs, setMsgs] = useState({ ...defaultMsgs });
  const { comm_id, sched_id } = useParams();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgs({ ...msgs, success: "", error: "" });
    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    data.active = data.active === "on";
    data.html_scrape_schedule = sched_id;
    let [success, results] = await commandService.update(data, comm_id);
    if (success) {
      setMsgs({ ...msgs, success: "Update successful" });
    } else {
      setMsgs({ ...msgs, error: "Failed to update command" });
      console.log(results);
    }
    return false;
  };

  useEffect(() => {
    const getData = async () => {
      let [success, data] = await commandService.getById(comm_id);
      if (success) {
        console.log(data);
        setSystemData({ ...systemData, ...data });
        setFailedRequest(false);
        setSentRequest(true);
      } else {
        setSentRequest(true);
        setFailedRequest(true);
      }
    };

    getData();
  }, [comm_id, sched_id]);

  if (!sentRequest) {
    return <h2>Waiting for data...</h2>;
  } else if (sentRequest && failedRequest) {
    return <h2>Something went wrong, failed to get data</h2>;
  } else {
    return (
      <>
        <h2>
          Command {comm_id} from <Link to={`/schedule/${sched_id}`}>Schedule {sched_id}</Link>
        </h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.name}
              placeholder="Enter command name"
              name="name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.description}
              name="description"
              placeholder="Describe your command here (optional)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Option</Form.Label>
            <Form.Select defaultValue={systemData.option} aria-label="Select command option" name="option">
              <option value="xpath">XPath</option>
              <option value="css_selector">CSS Selector</option>
              <option value="css_class">HTML Element Class</option>
              <option value="css_id">HTML Element ID</option>
              <option value="tag_attributes">HTML Tag Attributes</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Value</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.value}
              placeholder="Enter according value"
              name="value"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>HTML Tag</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.html_tags}
              placeholder="Specify target HTML element tag type (optional)"
              name="start_date"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check defaultChecked={systemData.active} type="switch" label="Active" name="active" />
          </Form.Group>

          {msgs.error && <p className="errMsgBox">{msgs.error}</p>}
          {msgs.success && <p className="successMsgBox">{msgs.success}</p>}
          <Row>
            <Col>
              <Button variant="primary" type="submit">
                Update
              </Button>
            </Col>
            <Col>
              <Button
                variant="primary"
                onClick={() => {
                  navigate(`/command/${sched_id}/${comm_id}/results`);
                }}
              >
                View Results
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
