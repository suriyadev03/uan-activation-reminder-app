import { useEffect, useState } from 'react';
import axios from 'axios';
import { dotSpinner } from 'ldrs';

export default function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState('');

  const handleFileChange = (e) => {
    console.log("file",file);
    setFile(e.target.files[0]);
  };
  useEffect(() => {
    dotSpinner.register();
}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    setAlert('')
    setIsSending(true);
    setProgress({ sent: 0, total: 0 });

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await axios.post('https://uan-activation-reminder-server.vercel.app/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { total, sent } = response.data;
      setProgress({ sent, total });
      setMessage(`Emails sent: ${sent} out of ${total}`);
      setAlert(`Sending emails... ${progress.sent} out of ${progress.total}`)
      setFile(null)
    } catch (error) {
      setMessage('Error uploading file or sending emails');
      console.error(error);
    } finally {
      setIsSending(false);
      setFile(null)
    }
  };

  return (
    <div className='main'>
    <div className="container">
      <h1 className="title">Upload Excel File to Send Reminder</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" required className="file-input" />
        <button type="submit" className="submit-button" disabled={!file}><span>Upload & Send Emails </span> {isSending && <l-dot-spinner size="40" speed="0.9" color="white" ></l-dot-spinner>}</button>
      </form>
      {/* <p className="progress">{alert}</p> */}
      {message && <p className="message">{alert}</p>}
    </div>
    </div>
  );
}
