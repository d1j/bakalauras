import { useNavigate, useParams } from "react-router-dom";
import { scheduleService } from "../api";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import moment from "moment";

const defaultMsgs = { success: "", error: "" };

export default function Schedule() {
  const [failedRequest, setFailedRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const { sched_id } = useParams();
  const [systemData, setSystemData] = useState({});
  const [msgs, setMsgs] = useState({ ...defaultMsgs });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgs({ ...msgs, success: "", error: "" });
    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    data.active = data.active === "on" ? true : false;
    let [success, results] = await scheduleService.update(data, sched_id);
    if (success) {
      setMsgs({ ...msgs, success: "Update successful" });
    } else {
      setMsgs({ ...msgs, error: "Failed to update schedule" });
      console.log(results);
    }
    return false;
  };

  useEffect(() => {
    const getData = async () => {
      let [success, data] = await scheduleService.getById(sched_id);
      if (success) {
        data.created = new Date(data.created);
        data.updated = new Date(data.updated);
        data.start_date = new Date(data.start_date);
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
  }, [sched_id]);

  if (!sentRequest) {
    return <h2>Waiting for data...</h2>;
  } else if (sentRequest && failedRequest) {
    return <h2>Something went wrong, failed to get data</h2>;
  } else {
    return (
      <>
        <h2>Schedule: {sched_id}</h2>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={systemData.name}
                  placeholder="Enter schedule name"
                  name="name"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Created at</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  defaultValue={systemData.created.toISOString()}
                  placeholder="Enter schedule name"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Last updated at</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  defaultValue={systemData.updated.toISOString()}
                  placeholder="Enter schedule name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Target URL</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.url}
              placeholder="Specify target URL to scrape."
              name="url"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              defaultValue={systemData.description}
              name="description"
              placeholder="Describe your schedule here (optional)"
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Start date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  defaultValue={moment(systemData.start_date).format("YYYY-MM-DDTHH:mm")}
                  placeholder="Describe your schedule here (optional)"
                  name="start_date"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Frequency</Form.Label>
                <Form.Select
                  defaultValue={systemData.frequency}
                  aria-label="Select scraping frequency"
                  name="frequency"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>checkbox
                  <option value="debug5s">Every 5 seconds</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

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
                  navigate(`/command/${sched_id}`);
                }}
              >
                View schedule commands
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
