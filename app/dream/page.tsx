"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link"
import { UploadDropzone } from "react-uploader";
import { Uploader } from "uploader";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingDots from "../../components/LoadingDots";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import DropDown from "../../components/DropDown";
import { useForm } from "react-hook-form";
import { NextApiRequest , NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";

const BUCKET_URL = "https://s3.console.aws.amazon.com/s3/buckets/radiance-lamim?region=us-east-2&tab=objects";

import { productType, products, roomType, rooms, themeType, themes } from "../../utils/dropdownTypes";
import axios from "axios";
const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    : "free",
});



const options = {
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: "#2563EB", // Primary buttons & links
      error: "#d23f4d", // Error messages
      shade100: "#fff", // Standard text
      shade200: "#fffe", // Secondary button text
      shade300: "#fffd", // Secondary button text (hover)
      shade400: "#fffc", // Welcome text
      shade500: "#fff9", // Modal close button
      shade600: "#fff7", // Border
      shade700: "#fff2", // Progress indicator background
      shade800: "#fff1", // File item background
      shade900: "#ffff", // Various (draggable crop buttons, etc.)
    },
  },
};

export default function DreamPage() {
  
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [theme, setTheme] = useState<themeType>("Example : Minimalistic");
  const [room, setRoom] = useState<roomType>("Canny ");
  const [product, setProduct] = useState<productType>("Example : Sofa");

  const postData = {
    text_prompt: "no sharks",
    theme: {theme},
    neg_text_prompt: "no sharks",
    original_image_url: "https://example.com/image.jpg",
    product: {product},
  };

const s3 =new S3({
  accessKeyId:process.env.ACCESS_KEY,
  secretAccessKey : process.env.SECRET_KEY,
  signatureVersion:"v4",

});
const [file, setFile] = useState<any>();
const [uploadingStatus, setUploadingStatus] = useState<any>();
const [uploadedFile, setUploadedFile] = useState<any>();

const selectFile = (e) => {
  setFile(e.target.files[0]);
};

const uploadFile = async () => {
  setUploadingStatus("Uploading the file to AWS S3");

  let { data } = await axios.post("/api/s3/uploadFile", {
    name: file.name,
    type: file.type,
  });

  console.log(data);

  const url = data.url;
  let { data: newData } = await axios.put(url, file, {
    headers: {
      "Content-type": file.type,
      "Access-Control-Allow-Origin": "*",
    },
  });

  setUploadedFile(BUCKET_URL + file.name);
  setFile(null);
};



    



  const handleClick = () => {
    const url = "https://94ca7251-f3d9-4de7-8856-49dc64e48bd5.mock.pstmn.io";
    const options = {
      method: "POST",
      body: JSON.stringify(postData),
    };
    
    fetch(url, options).then(response => {
      if (response.ok) {
        console.log(response)
        console.log("Image generated successfully");
      } else {
        console.log("Error generating image");
      }
    });
  };
  const UploadDropZone = () => (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
          setPhotoName(file[0].originalFile.originalFileName);
          setOriginalPhoto(file[0].fileUrl.replace("raw", "thumbnail"));
          generatePhoto(file[0].fileUrl.replace("raw", "thumbnail"));
        }
      }}
      width="670px"
      height="250px"
    />
  );
  const handleChangeRoom = (newRoom) => {
    setRoom(newRoom);
  };
  const handleChangeTheme = (newTheme) => {
    setTheme(newTheme);
  };  const handleChangeProduct = (newProduct) => {
    setProduct(newProduct);
  };

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: fileUrl, theme, room }),
    });

    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      setRestoredImage(newPhoto[1]);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1300);
  }

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
          Generate your <span className="text-blue-600">dream</span> image
        </h1>
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">
              {!restoredImage && (
                <>
                  <table border={1} width={'100%'} cellPadding={20}>
                    <tr>
                      <td colSpan={2}>
                        <div className="space-y-4 w-full max-w-sm">
                          <div className="flex mt-3 items-center space-x-3">
                            <p className="text-left font-medium">
                              Select Your Product 
                            </p>
                      
                          </div>
                          <DropDown
                          theme={product}
                          setTheme={handleChangeProduct}
                          themes={products}
                          />
                          
                        </div>
                       
                      </td>

                      <td rowSpan={1} align="center"> 
                        <div className="mt-4 w-full max-w-sm">
                          <div className="flex mt-6 w-96 items-center space-x-3">
                            <p className="text-left font-medium" >
                            Upload a picture of your room.
                            </p>
                          </div>
                        </div>
                      </td>
                      
                  </tr>

                  <tr>
                  <td colSpan={2}>
                        <div className="space-y-4 w-full max-w-sm">
                          <div className="flex mt-3 items-center space-x-3">
                            <p className="text-left font-medium">
                              Select the style 
                            </p>

                          </div>
                          <DropDown
                          theme={theme}
                          setTheme={handleChangeTheme}
                          themes={themes}
                          />
                      </div>
                    </td>
                    <td rowSpan={4}>
              {restoredImage && (
                <div>
                  Here's your remodeled <b>{room.toLowerCase()}</b> in the{" "}
                  <b>{theme.toLowerCase()}</b> theme!{" "}
                </div>
              )}
              <div
                className={`${
                  restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
                }`}
              >
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto!}
                  restored={restoredImage!}
                />
              )}
              {!originalPhoto && <UploadDropZone />}
              {originalPhoto && !restoredImage && (
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl h-96"
                  width={475}
                  height={475}
                />
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>


    
                    <h2 className="mb-1 font-medium text-lg">Original Room</h2>
                    <Image
                      alt="original photo"
                      src={originalPhoto}
                      className="rounded-2xl relative w-full h-96"
                      width={475}
                      height={475}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg">Generated Room</h2>
                    <a href={restoredImage} target="_blank" rel="noreferrer">
                      <Image
                        alt="restored photo"
                        src={restoredImage}
                        className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
                        width={475}
                        height={475}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                    </a>
                  </div>
                </div>
              )}
              {loading && (
                <button
                  disabled
                  className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}<div className="flex space-x-2 justify-center">
                {originalPhoto && !loading && (
                  <button
                    onClick={//() => {
                      //setOriginalPhoto(null);
                      //setRestoredImage(null);
                      //setRestoredLoaded(false);
                      //setError(null);
                  //  }
                  handleClick}
                    className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition"
                  >
                    Generate New Room
                  </button>
                )}
                {restoredLoaded && (
                  <button
                    onClick={() => {
                      downloadPhoto(
                        restoredImage!,
                        appendNewToName(photoName!)
                      );
                    }}
                    className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
                  >
                    Download Generated Room
                  </button>
                )}
              </div>
            </td>
                  
                  
                    </tr>
                  <tr>
            <td align="left" colSpan={2}><label >
    Describe your scene:
    <br/>
    <input type="text" name="name" width={'150%'} height={5} />
  </label></td>
                  </tr>

<tr><td align="left" colSpan={2}><div className="flex mt-3 items-center space-x-3"><label >
    Anything you dont want :
    <br/>
    <input type="text" name="name" width={30} height={5}  />
  </label></div>
  
 </td><td> <div className="uploader__widget-base__children">
      
      <p>Please select a file to upload</p>
        <input type="file" onChange={(e) => selectFile(e)} />
        {file && (
          <>
            <p>Selected file: {file.name}</p>
            <button
              onClick={uploadFile}
              className=" bg-purple-500 text-white p-2 rounded-sm shadow-md hover:bg-purple-700 transition-all"
            >
              Upload a File!
            </button>
          </>
        )}
        {uploadingStatus && <p>{uploadingStatus}</p>}
        {uploadedFile && <img src={uploadedFile} />}



      <div className="flex sm:space-x-4 sm:flex-row flex-col">
 </div>  </div></td></tr>


                     
                 
                  </table>
                  
                  
                  
                 
                </>
              )}
              </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
    </div>
  );
}
