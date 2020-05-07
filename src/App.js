import React, { useState } from "react";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import Navigation from "./components/Navigations/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";
import SignIn from "./Sign/SignIn";
import Register from "./components/Register/Register";

const app = new Clarifai.App({
  apiKey: "8d808ca0358241eba156f4455a4bb4c2",
});

const paramsOptions = {
  particles: {
    number: {
      value: 100,
    },
    size: {
      value: 3,
    },
  },
};

const initialState = {
  id: "",
  name: "",
  email: "",
  entries: 0,
  password: "",
  joined: "",
};

function App() {
  const [inputValue, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [box, setBox] = useState({}); //face dectect box
  const [signInRoute, setSignInRoute] = useState("signin");
  const [isSignIn, setIsSignIn] = useState(false);
  const [updateUser, setUpdateUser] = useState(initialState);

  const handleUserUpdate = (data) => {
    setUpdateUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      password: data.password,
      joined: data.joined,
    });
  };

  const onChangeRoute = (route) => {
    if (route === "home") {
      setIsSignIn(true);
    } else if (route === "signout") {
      setUpdateUser(initialState);
      setIsSignIn(false);
      setInput("");
      setImageUrl("");
      setBox("");
    }
    setSignInRoute(route);
  };

  const imageCalculation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      rightCol: width - clarifaiFace.right_col * width,
      topRow: clarifaiFace.top_row * height,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  // set the calculated image value to display function
  const displayFaceBox = (calculatedImage) => {
    setBox(calculatedImage);
  };

  const onChangeHandle = (e) => {
    setInput(e.target.value);
  };

  const onSubmitPicture = () => {
    setImageUrl(inputValue);
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, inputValue)
      .then((response) => {
        if (response) {
          fetch(" https://limitless-fortress-98511.herokuapp.com/findface", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: updateUser.id,
            }),
          })
            .then((response) => response.json())
            .then((data) =>
              setUpdateUser((prevState) => {
                return { ...prevState, entries: data };
              })
            )
            .catch((err) => console.log(err));
        }
        displayFaceBox(imageCalculation(response)).catch((error) =>
          console.log(error)
        );
      });
  };

  return (
    <div className="App">
      <Particles className="particles" params={paramsOptions} />
      <Navigation onChangeRoute={onChangeRoute} isSignedIn={isSignIn} />
      {signInRoute === "home" ? (
        <div>
          <Logo />
          <Rank updateUser={updateUser} />
          <ImageLinkForm
            onChangeHandle={onChangeHandle}
            onSubmitPicture={onSubmitPicture}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      ) : signInRoute === "signin" ? (
        <SignIn
          handleUserUpdate={handleUserUpdate}
          onChangeRoute={onChangeRoute}
        />
      ) : (
        <Register
          handleUserUpdate={handleUserUpdate}
          onChangeRoute={onChangeRoute}
        />
      )}
    </div>
  );
}

export default App;
