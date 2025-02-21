import { useEffect, useState } from 'react';
import { dotSpinner } from 'ldrs';

export default function App() {
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAlert('');
    setMessage('');
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

  setIsSending(true);

  const formData = new FormData();
  formData.append('excelFile', file);

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let sent = 0;
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    
      const chunk = decoder.decode(value, { stream: true });
    
      // Each line in the stream is a JSON object
      const lines = chunk.trim().split('\n');
    
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
    
          if (parsed.sentCount !== undefined) {
            sent = parsed.sentCount;
            setAlert(`Sending emails... ${sent} out of ${total}`);
            if (sent === total) setMessage('All Reminders Sent Successfully');
          } 
          else if (parsed.total !== undefined) {
            total = parsed.total;
          } 
          else if (parsed.error) {
            console.error(`Error: ${parsed.error}`);
            setAlert(`Error: ${parsed.error}`);
            setIsSending(false);
            // setFile(null)
          }
        } catch (err) {
          console.log("Error parsing response:", line, err);
        }
      }
    }
    

    if(sent > 0 ) setAlert(`Emails sent: ${sent} out of ${total}`);
    if(sent === total) setMessage('All Reminder Sent Successfully')
  } catch (error) {
    setMessage('Error uploading file or sending emails');
    console.error(error);
  } finally {
    setIsSending(false);
    setFile(null);
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
      <p className="message">{alert}</p>
      <p className="progress">{message}</p>
    </div>
    </div>
  );
}
