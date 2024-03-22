import React, { Component } from "react";

class ArmInput extends Component {
  constructor(props) {
    super(props);
    var startval = 0.65;
    this.radiuses = [
      [0.5, 0.5, 0.5, 0.3],
      [0.5, 0.5, 0.5, 0.3],
    ];
    this.state = {
      currentText: this.props.lsystemstring,
      chosenDepth: this.props.depth,
      lr1: this.mapLogarithmic(startval),
      lr2: this.mapLogarithmic(startval),
      lr1_val: startval,
      lr2_val: startval,
      updateCB: this.props.updateCB,
      radiuses: this.radiuses,
    };

    this.newLR1 = this.newLR1.bind(this);
    this.newLR2 = this.newLR2.bind(this);
    this.newR1_1 = this.newR1_1.bind(this);
    this.newR1_2 = this.newR1_2.bind(this);
    this.newR1_3 = this.newR1_3.bind(this);
    this.newR1_4 = this.newR1_4.bind(this);
    this.newR2_1 = this.newR2_1.bind(this);
    this.newR2_2 = this.newR2_2.bind(this);
    this.newR2_3 = this.newR2_3.bind(this);
    this.newR2_4 = this.newR2_4.bind(this);

    this.newLR1(startval);
    this.newLR2(startval);

    this.state.updateCB({ radiuses: this.radiuses });
  }
  newLR1(val) {
    // Map the input from [0, 1] to the desired logarithmic scale [1.0, 0.000001]
    const logVal = this.mapLogarithmic(val, 0, 1, 0.000001, 1.0);
    var newupdate = { lr1: logVal, lr1_val: val };
    this.setState(newupdate);
    this.state.updateCB(newupdate);
  }

  newLR2(val) {
    const logVal = this.mapLogarithmic(val);
    var newupdate = { lr2: logVal, lr2_val: val };
    this.setState(newupdate);
    this.state.updateCB(newupdate);
  }

  // Function to map the value
  mapLogarithmic(value) {
    const inMin = 0;
    const inMax = 1;
    const outMin = 0.0001;
    const outMax = 0.05;
    // Convert the input to a logarithmic scale. The base of the logarithm can be adjusted.
    const base = 10; // Adjust this base to change the curve's steepness
    const logMin = Math.log(outMin) / Math.log(base);
    const logMax = Math.log(outMax) / Math.log(base);
    const scale = (logMax - logMin) / (inMax - inMin);
    return Math.pow(base, logMin + scale * (value - inMin));
  }

  newR1_1(val) {
    this.radiuses[0][0] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR1_2(val) {
    this.radiuses[0][1] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR1_3(val) {
    this.radiuses[0][2] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR1_4(val) {
    this.radiuses[0][3] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }

  newR2_1(val) {
    this.radiuses[1][0] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR2_2(val) {
    this.radiuses[1][1] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR2_3(val) {
    this.radiuses[1][2] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }
  newR2_4(val) {
    this.radiuses[1][3] = val;
    this.setState({ radiuses: this.radiuses });
    this.state.updateCB({ radiuses: this.radiuses });
  }

  render() {
    var depthNotice = "";

    return (
      <div>
        <center>
          <div id="selector-change-div">
            <table>
              <tbody>
                <tr>
                  <td>
                    <small>Blue step size</small>
                  </td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={this.state.lr2_val}
                      onChange={(e) => this.newLR2(parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <small>{this.state.lr2.toPrecision(4)}</small>
                  </td>
                </tr>
                <tr>
                  <td>
                    <small>Yellow step size</small>
                  </td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={this.state.lr1_val}
                      onChange={(e) => this.newLR1(parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <small>{this.state.lr1.toPrecision(4)}</small>
                  </td>
                </tr>
              </tbody>
            </table>

            <br />
            <br />
            <table>
              <tbody>
                <tr>
                  <td>
                    <small>Blue arm lengths</small>
                  </td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[0][0]}
                      onChange={(e) => this.newR1_1(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[0][1]}
                      onChange={(e) => this.newR1_2(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[0][2]}
                      onChange={(e) => this.newR1_3(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[0][3]}
                      onChange={(e) => this.newR1_4(parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
            <br />
            <table>
              <tbody>
                <tr>
                  <td>
                    <small>Yello arm lengths</small>
                  </td>
                  <td>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[1][0]}
                      onChange={(e) => this.newR2_1(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[1][1]}
                      onChange={(e) => this.newR2_2(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[1][2]}
                      onChange={(e) => this.newR2_3(parseFloat(e.target.value))}
                    />
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={this.state.radiuses[1][3]}
                      onChange={(e) => this.newR2_4(parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </center>
      </div>
    );
  }
}

export default ArmInput;
