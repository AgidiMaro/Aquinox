import React, { Component } from "react";
import { AuditReport } from "../../../models/AuditReport";
import ChartReport from "./chart/ChartReport";
import TableReport from "./table/TableReport";

export interface ResultProps {
  report: AuditReport,
  modeSwitch: () => void;
}

class Result extends Component<ResultProps> {
  state = {
    isTableView : true
  }

  render() {
    const isTable = this.state.isTableView;

    return (
      <>
        {isTable
          ? <TableReport report={this.props.report} modeSwitch={this.updateTableViewStatus} />
          : <ChartReport report={this.props.report} modeSwitch={this.updateTableViewStatus} />
        }
      </>
    );
  }

  updateTableViewStatus = () => {
    this.setState({isTableView: !this.state.isTableView});
  }
}

export default Result