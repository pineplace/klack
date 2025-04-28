import React, { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";

const RecordingStartCountdown = () => {
  const [counter, setCounter] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((counter) => {
        if (counter) {
          return counter - 1;
        }
        return counter;
      });
    }, 1 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Stack
      sx={{
        position: "fixed",
        left: 10,
        top: 10,
        zIndex: 2147483647,
        userSelect: "none",
      }}
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      <Typography
        variant="h1"
        component="h2"
      >
        {counter}
      </Typography>
    </Stack>
  );
};

export default RecordingStartCountdown;
