import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/Styles6.css';

const Solutions = () => {
  const { subjectName, topicName } = useParams(); // Get subject and topic names from the route parameter
  const [solutions, setSolutions] = useState([]);
  const [newSolution, setNewSolution] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch solutions for the selected topic
    fetch(`http://localhost:5000/topics/${topicName}/solutions`)
      .then(response => response.json())
      .then(data => setSolutions(data))
      .catch(error => console.error('Error fetching solutions:', error));
  }, [topicName]);

  const handleAddSolution = (event) => {
    event.preventDefault();

    fetch(`http://localhost:5000/topics/${topicName}/solutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content: newSolution, username: username }),
    })
      .then(response => response.text())
      .then(data => {
        if (data === 'Solution added successfully') {
          setSolutions(prevSolutions => [...prevSolutions, { username, content: newSolution, upvotes: 0 }]);
          setNewSolution('');
          setUsername('');
          setMessage('Solution added successfully');
        } else {
          setMessage(data);
        }
      })
      .catch(error => {
        console.error('Error adding solution:', error);
        setMessage('Error adding solution. Please try again.');
      });
  };
  const handleUpvoteClick = (index) => {
    const solution = solutions[index];
  
    fetch(`http://localhost:5000/topics/${topicName}/solutions/${solution.id}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(response => response.text())
    .then(data => {
      if (data === 'Upvoted successfully') {
        // Update the upvote count locally
        setSolutions(prevSolutions => {
          const newSolutions = [...prevSolutions];
          newSolutions[index].upvotes += 1;
          return newSolutions;
        });
        setMessage('Upvoted successfully');
      } else {
        setMessage(data);
      }
    })
    .catch(error => {
      console.error('Error upvoting solution:', error);
      setMessage('Error upvoting solution. Please try again.');
    });
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

      <div className="topic-heading">Solutions for {topicName}</div>
      <div className="answers-container">
        {solutions.map((solution, index) => (
          <div className="card" key={index}>
            <div className="user-name">{solution.username}</div>
            <div className="card-content">
              <p>{solution.content}</p>
            </div>
            <div className="card-buttons">
              <div
                className="upvote-button"
                onClick={() => handleUpvoteClick(index)}
              >
                <span className="upvote-icon">&#9650;</span> <span className="upvote-count">{solution.upvotes}</span>
              </div>
              <a href="share-page.html" className="share-button">Share</a>
            </div>
          </div>
        ))}
      </div>

      <div className="question-form">
        <div className="question-card">
          <h2>Submit a new solution</h2>
          <form onSubmit={handleAddSolution}>
            <input
              type="text"
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
              placeholder="Enter your solution"
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

export default Solutions;
