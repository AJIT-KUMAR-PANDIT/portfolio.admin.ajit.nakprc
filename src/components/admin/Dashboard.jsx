import React from 'react';
import { FaThumbsUp, FaComments, FaShareAlt } from 'react-icons/fa';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <div className="dashboard-widgets">
        <div className="widget">
          <FaThumbsUp className="widget-icon" />
          <h2>Total Likes</h2>
          <p>50,120</p>
        </div>
        <div className="widget">
          <FaComments className="widget-icon" />
          <h2>Comments</h2>
          <p>25,120</p>
        </div>
        <div className="widget">
          <FaShareAlt className="widget-icon" />
          <h2>Total Share</h2>
          <p>10,320</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2 className="recent-activity-title">Recent Activity</h2>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prem Shahi</td>
              <td>premshahi@gmail.com</td>
              <td>2022-02-12</td>
              <td>New</td>
              <td>Liked</td>
            </tr>
            <tr>
              <td>Deepa Chand</td>
              <td>deepachand@gmail.com</td>
              <td>2022-02-12</td>
              <td>Member</td>
              <td>Shared</td>
            </tr>
            <tr>
              <td>Prakash shahi</td>
              <td>prakashshahi@gmail.com</td>
              <td>2022-02-13</td>
              <td>New</td>
              <td>Liked</td>
            </tr>
            <tr>
              <td>Manisha Chand</td>
              <td>manishachan@gmail.com</td>
              <td>2022-02-13</td>
              <td>Member</td>
              <td>Shared</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}