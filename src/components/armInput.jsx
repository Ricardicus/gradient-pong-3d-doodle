import React, { Component } from "react";

class ArmInput extends Component {
  constructor(props) {
    super(props);
    var startval = 0.65;
    this.state = {
      currentText: this.props.lsystemstring,
      chosenDepth: this.props.depth,
      lr1: this.mapLogarithmic(startval),
      lr2: this.mapLogarithmic(startval),
      lr1_val: startval,
      lr2_val: startval,
      updateCB: this.props.updateCB,
    };
    this.newLR1 = this.newLR1.bind(this);
    this.newLR2 = this.newLR2.bind(this);

    this.newLR1(startval);
    this.newLR2(startval);
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
          </div>
        </center>
      </div>
    );
  }
}

export default ArmInput;
