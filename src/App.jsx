import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setIsSending(true);
    setProgress({ sent: 0, total: 0 });

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { total, sent } = response.data;
      setProgress({ sent, total });
      setMessage(`Emails sent: ${sent} out of ${total}`);
    } catch (error) {
      setMessage('Error uploading file or sending emails');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Upload Excel File to Send Emails</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" required className="file-input" />
        <button type="submit" className="submit-button">Upload & Send Emails</button>
      </form>
      {isSending && <p className="progress">Sending emails... {progress.sent} out of {progress.total}</p>}
      {message && <p className="message">{message}</p>}
    </div>
  );
}
