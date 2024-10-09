import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../Styles/Styles5.css'; // Ensure this CSS file includes the necessary styles

const Topics = () => {
  const { subjectName } = useParams(); // Get the subject name from the route parameter
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState(''); // State for new topic
  const [username, setUsername] = useState(''); // State for username
  const [message, setMessage] = useState(''); // State for messages
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch topics from the server based on the selected subject
    fetch(`http://localhost:5000/subjects/${subjectName}/topics`)
      .then(response => response.json())
      .then(data => setTopics(data))
      .catch(error => console.error('Error fetching topics:', error));
  }, [subjectName]);

  const handleAddTopic = (event) => {
    event.preventDefault();

    fetch(`http://localhost:5000/subjects/${subjectName}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ topic_name: newTopic, username: username }),
    })
    .then(response => response.text())
    .then(data => {
      if (data === 'Topic added successfully') {
        setTopics(prevTopics => [...prevTopics, newTopic]);
        setNewTopic('');
        setUsername('');
        setMessage('Topic added successfully');
      } else {
        setMessage(data);
      }
    })
    .catch(error => {
      console.error('Error adding topic:', error);
      setMessage('Error adding topic. Please try again.');
    });
  };

  const handleTopicClick = (topic) => {
    navigate(`/Topics/${topic}/Solutions`); // Navigate to Solutions page with selected topic
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand">SolutionsHub</div>
        <div className="navbar-options">
          <a href="/Subjects">Subjects</a>
          <a href="/Profile">Profile</a>
          <a href="/Login">Log out</a>
        </div>
      </div>

      <div className="question-card">
        <h2>Topics for {subjectName}</h2>
        <ul>
          {topics.map((topic, index) => (
            <li key={index}>
              <button className="topic-button" onClick={() => handleTopicClick(topic)}>
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="question-form">
        <div className="question-card">
          <h2>Add Topic</h2>
          <form onSubmit={handleAddTopic}>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter topic name"
              required
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            <input type="submit" value="Submit" />
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Topics;
