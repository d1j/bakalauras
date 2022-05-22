import React, { useEffect, useState } from "react";
import { commandService } from "../api";
import { Pagination, Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ActiveIcon, DisabledIcon, DeleteIcon, EditIcon } from "../Details/Details";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForceUpdate } from "../utils";

export default function CommandList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(null);
  const [results, setResults] = useState([]);
  const [failedRequest, setFailedRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const [disablePrevPage, setDisablePrevPage] = useState(true);
  const [disableNextPage, setDisableNextPage] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeletedCommand, setToBeDeletedCommand] = useState(null);

  const { sched_id } = useParams();
  const navigate = useNavigate();
  const [update, forceUpdate] = useForceUpdate();

  const openDeleteCommandModal = (scheduleId) => {
    setShowDeleteModal(true);
    setToBeDeletedCommand(scheduleId);
  };

  const closeDeleteCommandModal = () => {
    setShowDeleteModal(false);
    setToBeDeletedCommand(null);
  };

  const deleteCommand = async () => {
    await commandService.delete(toBeDeletedCommand);
    let isOnLastPageWithLastElement = Math.ceil(totalResults / pageSize) === page && results.length === 1;
    if (isOnLastPageWithLastElement) {
      getPrevPage();
    } else {
      forceUpdate();
    }
    closeDeleteCommandModal();
  };

  const getNextPage = () => {
    let nextPage = `/command/${sched_id}/?page=${page + 1}&pageSize=${pageSize}`;
    setPage(page + 1);
    navigate(nextPage);
  };

  const getPrevPage = () => {
    let prevPage = `/command/${sched_id}/?page=${page - 1}&pageSize=${pageSize}`;
    setPage(page - 1);
    navigate(prevPage);
  };

  useEffect(() => {
    const getData = async () => {
      let params = new URL(document.location).searchParams;
      let _page = +params.get("page") || 1;
      let _pageSize = +params.get("pageSize") || 10;
      let [success, data] = await commandService.getAllScheduleCommands(sched_id, _page, _pageSize);
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
        <h2>
          <Link to={`/schedule/${sched_id}`}>Schedule {sched_id}</Link> Commands
        </h2>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Active</th>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Option</th>
              <th scope="col">Value</th>
              <th scope="col">HTML Tag</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr className="align-middle" key={result.id}>
                <td>{result.id}</td>
                <td className="text-center">{result.active ? <ActiveIcon /> : <DisabledIcon />} </td>
                <td>{result.name}</td>
                <td>{result.description || ""}</td>
                <td>{result.option}</td>
                <td>{result.value}</td>
                <td>{result.html_tag}</td>
                <OverlayTrigger placement="top" overlay={<Tooltip>Show {result.num_results} command results</Tooltip>}>
                  <td className="text-center align-middle">
                    <Link to={`/command/${sched_id}/${result.id}/results`}>{result.num_results}</Link>
                  </td>
                </OverlayTrigger>
                <td>
                  <Link to={`/command/${sched_id}/${result.id}/`}>
                    <EditIcon />
                  </Link>
                </td>
                <td>
                  <div onClick={() => openDeleteCommandModal(result.id)} style={{ cursor: "pointer" }}>
                    <DeleteIcon />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination>
          <Pagination.Prev disabled={disablePrevPage} onClick={getPrevPage} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next disabled={disableNextPage} onClick={getNextPage} />
        </Pagination>

        <Modal backdrop="static" show={showDeleteModal} keyboard={true} onEscapeKeyDown={closeDeleteCommandModal}>
          <Modal.Header>
            <Modal.Title>Are you sure you want to delete command {toBeDeletedCommand}?</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Deleting command will also delete its results.</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteCommandModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={deleteCommand}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
