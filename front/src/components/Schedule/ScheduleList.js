import React, { useEffect, useState } from "react";
import { scheduleService } from "../api";
import { Pagination, Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ActiveIcon, DisabledIcon, DeleteIcon, EditIcon } from "../Details/Details";
import { Link, useNavigate } from "react-router-dom";
import { useForceUpdate } from "../utils";

export default function ScheduleList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(null);
  const [results, setResults] = useState([]);
  const [failedRequest, setFailedRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const [disablePrevPage, setDisablePrevPage] = useState(true);
  const [disableNextPage, setDisableNextPage] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeletedSchedule, setToBeDeletedSchedule] = useState(null);

  const navigate = useNavigate();
  const [update, forceUpdate] = useForceUpdate();

  const openDeleteScheduleModal = (scheduleId) => {
    setShowDeleteModal(true);
    setToBeDeletedSchedule(scheduleId);
  };

  const closeDeleteScheduleModal = () => {
    setShowDeleteModal(false);
    setToBeDeletedSchedule(null);
  };

  const deleteSchedule = async () => {
    await scheduleService.delete(toBeDeletedSchedule);
    let isOnLastPageWithLastElement = Math.ceil(totalResults / pageSize) === page && results.length === 1;
    if (isOnLastPageWithLastElement) {
      getPrevPage();
    } else {
      forceUpdate();
    }
    closeDeleteScheduleModal();
  };

  const getNextPage = () => {
    let nextPage = `/schedule?page=${page + 1}&pageSize=${pageSize}`;
    setPage(page + 1);
    navigate(nextPage);
  };

  const getPrevPage = () => {
    let prevPage = `/schedule?page=${page - 1}&pageSize=${pageSize}`;
    setPage(page - 1);
    navigate(prevPage);
  };

  useEffect(() => {
    const getData = async () => {
      let params = new URL(document.location).searchParams;
      let _page = +params.get("page") || 1;
      let _pageSize = +params.get("pageSize") || 10;
      let [success, data] = await scheduleService.getAll(_page, _pageSize);
      if (success) {
        let { count, results } = data;
        let _disablePrevPage = _page === 1;

        let _disableNextPage = count / _pageSize > _page ? false : true;

        setFailedRequest(false);
        setSentRequest(true);
        setTotalResults(count);
        setResults([...results]);
        setPage(_page);
        setPageSize(_pageSize);
        setDisableNextPage(_disableNextPage);
        setDisablePrevPage(_disablePrevPage);
      } else {
        setSentRequest(true);
        setFailedRequest(true);
      }
    };

    getData();
  }, [page, update]);

  if (!sentRequest) {
    return <h2>Waiting for data...</h2>;
  } else if (sentRequest && failedRequest) {
    return <h2>Something went wrong, failed to get data</h2>;
  } else {
    return (
      <div>
        <h2>Your schedules ({totalResults})</h2>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Active</th>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">URL</th>
              <th scope="col">Frequency</th>
              <th scope="col">Start date</th>
              <th scope="col">Last updated</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr className="align-middle" key={result.id}>
                <td>{result.id}</td>
                <td className="text-center">{result.active ? <ActiveIcon /> : <DisabledIcon />} </td>
                <td>{result.name}</td>
                <td>{result.description || ""}</td>
                <td>
                  <a href={result.url} target="_blank">
                    {result.url}
                  </a>
                </td>
                <td>{result.frequency}</td>
                <td>{result.start_date}</td>
                <td>{result.updated}</td>
                <OverlayTrigger placement="top" overlay={<Tooltip>Show schedule commands</Tooltip>}>
                  <td className="text-center">
                    <Link to={`/command/${result.id}/`}>{result.num_commands}</Link>
                  </td>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Edit schedule {result.id}</Tooltip>}>
                  <td>
                    <Link to={`/schedule/${result.id}/`}>
                      <EditIcon />
                    </Link>
                  </td>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Delete schedule {result.id}</Tooltip>}>
                  <td>
                    <div onClick={() => openDeleteScheduleModal(result.id)} style={{ cursor: "pointer" }}>
                      <DeleteIcon />
                    </div>
                  </td>
                </OverlayTrigger>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination>
          <Pagination.Prev disabled={disablePrevPage} onClick={getPrevPage} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next disabled={disableNextPage} onClick={getNextPage} />
        </Pagination>

        <Modal backdrop="static" show={showDeleteModal} keyboard={true} onEscapeKeyDown={closeDeleteScheduleModal}>
          <Modal.Header>
            <Modal.Title>Are you sure you want to delete schedule {toBeDeletedSchedule}?</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Deleting schedule will also delete its commands and according results.</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteScheduleModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={deleteSchedule}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
