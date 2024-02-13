import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);
      detectPlant(photo.uri);
    }
  };

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.cancelled) {
      setImage(result.uri);
      detectPlant(result.uri);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
  
      const response = await axios.post(
        "https://api.plant.id/v2/identify",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Api-Key': 'NjvMu9yCMX2aGZ5S3v61OF1wzO7fMbOw4X6mc5r41zcHvKHjDL',
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.data) {
        console.error(error.response.data);
      } else {
        console.error(error);
      }
    }
  };
  
  

  const detectPlant = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
  
      const response = await axios.post(
        'https://api.plant.id/v2/identify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Api-Key': 'NjvMu9yCMX2aGZ5S3v61OF1wzO7fMbOw4X6mc5r41zcHvKHjDL',
          },
        }
      );
      setResults(response.data);
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Button title="Flip" onPress={handleCameraType} />
          <Button title="Take picture" onPress={handleTakePicture} />
          <Button title="Choose from library" onPress={handleChooseImage} />
        </View>
      </Camera>
      {loading && <Text>Loading...</Text>}
      {image && (
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: image }} />
          <Button title="Upload" onPress={handleUploadPhoto} />
        </View>
      )}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <Text key={index}>{result.name}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
