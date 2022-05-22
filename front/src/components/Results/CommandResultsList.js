import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { Link, useParams } from "react-router-dom";
import { commandResultService } from "../api";
import { ActiveIcon, DisabledIcon } from "../Details/Details";
import { isFloat, isInteger } from "../utils";

export default function CommandResultsList() {
  const [failedRequest, setFailedRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const [totalResults, setTotalResults] = useState(null);
  const [results, setResults] = useState([]);
  const [disabledGraphView, setDisabledGraphView] = useState(true);
  const [parsedResults, setParsedResults] = useState([]);
  const { comm_id, sched_id } = useParams();

  useEffect(() => {
    const getData = async () => {
      let [success, _results] = await commandResultService.getById(comm_id);
      if (success) {
        setFailedRequest(false);
        setSentRequest(true);
        setTotalResults(_results.length);
        setResults([..._results]);

        let _parsedResults = [];
        let shouldDisableGraphView = true;
        _results.forEach((result) => {
          let stripped = result.result.replace(/[^\d,.-]/g, "");
          stripped = stripped.replace(",", ".");
          let parsed = parseFloat(stripped);
          if (isFloat(parsed) || isInteger(parsed)) {
            _parsedResults.push(parsed);
            shouldDisableGraphView = false;
          }
        });
        setParsedResults([..._parsedResults]);
        setDisabledGraphView(shouldDisableGraphView);
        console.log(parsedResults);
        console.log(results);
      } else {
        setSentRequest(true);
        setFailedRequest(true);
      }
    };

    getData();
  }, [comm_id]);

  if (!sentRequest) {
    return <h2>Waiting for data...</h2>;
  } else if (sentRequest && failedRequest) {
    return <h2>Something went wrong, failed to get data</h2>;
  } else {
    return (
      <>
        <h2>
          Showing total {totalResults} <Link to={`/command/${sched_id}/${comm_id}`}>Command {comm_id}</Link> results
          from <Link to={`/schedule/${sched_id}`}>Schedule {sched_id}</Link>
        </h2>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Success</th>
              <th scope="col">Result</th>
              <th scope="col">Command run date</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result, index) => {
              let highlightResult = false;
              if (index > 0) {
                if (results[index].result !== results[index - 1].result) highlightResult = true;
              }
              return (
                <tr
                  className="align-middle"
                  key={result.id}
                  style={highlightResult ? { fontWeight: "bold", backgroundColor: "#fde8f9" } : {}}
                >
                  <td>{result.id}</td>
                  <td className="text-center">{result.success ? <ActiveIcon /> : <DisabledIcon />} </td>
                  <td>{result.result}</td>
                  <td>{result.command_run_date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!disabledGraphView && (
          <Line
            data={{
              labels: results.map((result) => result.command_run_date.toString()),
              datasets: [{ data: parsedResults, label: "Result" }],
            }}
          />
        )}
      </>
    );
  }
}
