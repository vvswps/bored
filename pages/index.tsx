import { NextPage } from "next";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io";
import io from "socket.io-client";

let socket: any;

const DrawingPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const strokeSizeInputRef = useRef<HTMLInputElement>(null);

  let isDrawingRef = useRef(false);
  let currentXRef = useRef(0);
  let currentYRef = useRef(0);

  useEffect(() => {
    socketInit();

    const canvas = canvasRef.current;
    const colorInput = colorInputRef.current;
    const strokeSizeInput = strokeSizeInputRef.current;

    if (canvas && colorInput && strokeSizeInput) {
      canvas.addEventListener("mousedown", (e) => {
        isDrawingRef.current = true;
        currentXRef.current = e.clientX - canvas.offsetLeft;
        currentYRef.current = e.clientY - canvas.offsetTop;
      });

      canvas.addEventListener("mousemove", (e) => {
        if (isDrawingRef.current) {
          const context = canvas.getContext("2d");
          if (context == null) {
            return;
          }
          context.strokeStyle = colorInput.value;
          context.lineWidth = parseInt(strokeSizeInput.value, 10);
          context.beginPath();
          context.moveTo(currentXRef.current, currentYRef.current);
          currentXRef.current = e.clientX - canvas.offsetLeft;
          currentYRef.current = e.clientY - canvas.offsetTop;
          context.lineTo(currentXRef.current, currentYRef.current);
          context.stroke();
          // send the data to the server
          // we need to send the data as a string
          // this should run only when the user stops drawing
          // so we need to check if the user is drawing
          // if the user is drawing, we don't need to send the data
          // because the data will be sent when the user stops drawing

          // const data = canvas.toDataURL();
          console.log("Sending data to server");
          socket.emit("draw", canvas.toDataURL());
        }
      });

      canvas.addEventListener("mouseup", () => {
        isDrawingRef.current = false;
        // downloadCanvas(canvas);
      });

      canvas.addEventListener("mouseout", () => {
        isDrawingRef.current = false;
      });

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  // const downloadCanvas = (canvas: HTMLCanvasElement) => {
  //   // get the data URI of the canvas
  //   const dataURI = canvas.toDataURL();
  //   // create a link element and set its href to the data URI
  //   const link = document.createElement("a");
  //   link.href = dataURI;
  //   // set the download attribute of the link to the desired file name
  //   link.download = "my-image.png";
  //   // append the link to the document and click it to trigger the download
  //   document.body.appendChild(link);
  //   link.click();
  //   // remove the link from the document
  //   document.body.removeChild(link);
  // };

  const socketInit = async () => {
    // this function is async because we need to wait for the socket to be initialized
    await fetch("/api/socket");

    socket = io();

    socket.on("boardUpdate", (data: any) => {
      // this is the data that we sent from the server
      // we need to draw the data on the canvas
      console.log("Received data from server");
      // console.log(`On the client side ${data}`);

      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context == null) {
          return;
        }
        const img = new Image();
        img.src = data;
        img.crossOrigin = "anonymous";

        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        img.onerror = (err) => {
          console.log(err);
        };
      }
    });
  };

  return (
    <div className="h-screen flex relative">
      {/* toolbar */}
      <div
        className="absolute bottom-16 right-32 bg-gray-200  rounded-full p-2 px-4 pr-6"
        id="toolbar"
      >
        <input type="color" ref={colorInputRef} id="color-input" />
        <div className="ml-2 inline-block ">
          <label htmlFor="stroke-size-input">Size</label>
          <input
            type="number"
            ref={strokeSizeInputRef}
            id="stroke-size-input"
            min={1}
            max={10}
            className="ml-2 w-10"
          />
        </div>
      </div>

      <canvas
        id="canvas"
        ref={canvasRef} // <--- here
        className="block h-full w-full bg-red-400"
      ></canvas>
    </div>
  );
};

export default DrawingPage;
