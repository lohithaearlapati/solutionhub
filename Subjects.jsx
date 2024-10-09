import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Styles4.css';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [usernameAdd, setUsernameAdd] = useState('');  // For add subject form
  const [usernameDelete, setUsernameDelete] = useState('');  // For delete subject form
  const [message, setMessage] = useState('');
  const [subjectToDelete, setSubjectToDelete] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const navigate = useNavigate();  // React Router hook for navigation

  useEffect(() => {
    // Fetch subjects from the server when the component mounts
    fetch('http://localhost:5000/subjects', {
      method: 'GET',
      credentials: 'include'  // To include the session cookie
    })
      .then(response => response.json())
      .then(data => setSubjects(data))
      .catch(error => console.error('Error fetching subjects:', error));
  }, []);
  
  const handleAddSubject = (e) => {
    e.preventDefault();
    
    fetch('http://localhost:5000/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        subject_name: newSubject,
        username: usernameAdd
      })
    })
      .then(response => {
        if (response.ok) {
          setMessage('Subject added successfully');
          setNewSubject(''); // Clear the input field
          setUsernameAdd('');
          // Fetch updated subjects
          return fetch('http://localhost:5000/subjects', { credentials: 'include' });
        } else {
          return response.text().then(text => setMessage(text));
        }
      })
      .then(response => response.json())
      .then(data => setSubjects(data))
      .catch(error => console.error('Error adding subject:', error));
  };
  
  const handleDeleteSubject = (e) => {
    e.preventDefault();
  
    fetch('http://localhost:5000/subjects/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        subject_name: subjectToDelete,
        username: usernameDelete
      })
    })
      .then(response => {
        if (response.ok) {
          setDeleteMessage('Subject deleted successfully');
          setSubjectToDelete(''); // Clear the input field
          setUsernameDelete('');
          // Fetch updated subjects
          return fetch('http://localhost:5000/subjects', { credentials: 'include' });
        } else {
          return response.text().then(text => setDeleteMessage(text));
        }
      })
      .then(response => response.json())
      .then(data => setSubjects(data))
      .catch(error => console.error('Error deleting subject:', error));
  };
  const handleSubjectClick = (subject) => {
    navigate(`/Subjects/${subject}/Topics`);  // Corrected navigation path
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

      <div className="questions">
        <div className="question-card">
          <h2>SUBJECTS</h2>
          <ul>
            {subjects.map((subject, index) => (
              <li key={index}>
                <button className="subject-button" onClick={() => handleSubjectClick(subject)}>
                  {subject}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="question-form">
          <div className="question-card">
            <h2>Add Subject</h2>
            <form onSubmit={handleAddSubject}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                required
              />
              <input
                type="text"
                value={usernameAdd}
                onChange={(e) => setUsernameAdd(e.target.value)}
                placeholder="Enter your username"
                required
              />
              <input type="submit" value="Submit" />
            </form>
            <p>{message}</p>
          </div>

          <div className="question-card">
            <h2>Delete Subject</h2>
            <form onSubmit={handleDeleteSubject}>
              <input
                type="text"
                value={subjectToDelete}
                onChange={(e) => setSubjectToDelete(e.target.value)}
                placeholder="Enter subject to delete"
                required
              />
              <input
                type="text"
                value={usernameDelete}
                onChange={(e) => setUsernameDelete(e.target.value)}
                placeholder="Enter your username"
                required
              />
              <input type="submit" value="Delete" />
            </form>
            <p>{deleteMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;