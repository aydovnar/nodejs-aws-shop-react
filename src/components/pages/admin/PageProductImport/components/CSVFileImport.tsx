import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    console.log("uploadFile to", url);

    const token = localStorage.getItem("authorization_token");
    let headers = {};
    if (token) headers = { Authorization: `Basic ${token}` };

    // Get the presigned URL
    try {
      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: headers,
      });

      // Handle the successful response
      console.log(response.data);
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);
      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(undefined);
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          // Handle 401 Unauthorized error
          window.dispatchEvent(
            new CustomEvent("global-toast", {
              detail: { message: "401 Unauthorized", severity: "error" },
            })
          );
        } else if (error.response.status === 403) {
          // Handle 403 Forbidden error
          window.dispatchEvent(
            new CustomEvent("global-toast", {
              detail: { message: "403 Forbidden", severity: "error" },
            })
          );
        } else {
          // Handle other error responses
          console.error("Error:", error.response.data);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something else happened in making the request
        console.error("Error:", error.message);
      }
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
