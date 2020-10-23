import React from 'react';
import style from './style.module.scss';

class Upload extends React.Component {
  handleChange (e) {
    console.dir(e.target.files);
  }
  render () {
    return (
      <div className={style.upload}>
        <input
          type="file"
          multiple={true}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default Upload;
