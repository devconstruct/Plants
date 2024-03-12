import React, { useState, useEffect, useRef } from 'react';//listo
import {
  StyleSheet,//listo
  Text,//listo
  View,//listo
  Button,//list
  Image,//listo
  FlatList,
} from 'react-native';
import { Camera } from 'expo-camera';//listo
import * as ImagePicker from 'expo-image-picker';//listo
import axios from 'axios';//listo

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);//listo
  const [type, setType] = useState(Camera.Constants.Type.back);//listo
  const [image, setImage] = useState(null);//listo
  const cameraRef = useRef(null);//listo
  //const [camera, setCamera] = useState(null); no se usa
  const [loading, setLoading] = useState(false);//listo
  const [results, setResults] = useState([]);//listo

  useEffect(() => {//
    (async () => {//
      //modificar, lo de abajo
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');//listo
    })();//listo
  }, []);//listo

  const handleCameraType = () => {//listo
    setType(//listo
      type === Camera.Constants.Type.back//listo
        ? Camera.Constants.Type.front//listo
        : Camera.Constants.Type.back//listo
    );//listo
  };//listo

  const handleTakePicture = async () => {//listo
    if (cameraRef.current) {//listo
      const photo = await cameraRef.current.takePictureAsync();//listo
      setImage(photo.uri);//listo
      detectPlant(photo.uri);//listo
    }//listo
  };//listo

  const handleChooseImage = async () => {//listo
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();//listo
    if (status !== 'granted') {//listo
      alert('Sorry, we need camera roll permissions to make this work!');//listo
      return;//listo
    }//listo

    //cambiar
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,//listo
      allowsEditing: true,//listo
      aspect: [4, 3],//listo
      quality: 1,//listo
    });//listo

    if (!result.cancelled) {//listo
      setImage(result.uri);//listo
      detectPlant(result.uri);//listo
    }
  };

  //modificar para capturar la foto
  const handleUploadPhoto = async () => {//listo
    //falta
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await axios.post(
        'https://api.plant.id/v3/identify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Api-Key': 'NjvMu9yCMX2aGZ5S3v61OF1wzO7fMbOw4X6mc5r41zcHvKHjDL',
          },
        }
      );
      setResults(response.data.suggestions);
    } catch (error) {
      console.log(error);
    }
  };

//falta
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
      setResults(response.data.suggestions);
    } catch (error) {
      console.log(error);
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
    //crea un componente View con un estilo de styles.container. Los componentes View se utilizan para crear un contenedor para otros componentes.
    <View style={styles.container}>
    {/*Crea un componente Camera que muestra la vista previa de la cámara.
     la propiedad type que determina si se utiliza la cámara frontal o trasera.*/}
      <Camera style={styles.camera} type={type} ref={cameraRef}></Camera>
      {/*Componente que que contiene los botones*/}
      <View style={styles.buttonContainer}>
      {/*Cuando se presiona el botón, se ejecuta la función handleCameraType para cambiar el tipo de cámara. */}
          <Button title="Flip" onPress={handleCameraType} />
          <Button title="Take Picture" onPress={handleTakePicture} />
        </View>
        {/*la variable image verifica si la variable image está definida y no es nula. */}
      {image && (
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: image }} />
        </View>
      )}

      {loading && <Text style={styles.resultText}>Cargando...</Text>}
      {/*Verifica si la longitud del array results es mayor que 0.*/}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
        {/*FlatList Es una vista de lista eficiente que se usa comúnmente para renderizar listas largas de datos.*/}
          <FlatList
            data={results}
            //una función keyExtractor que se usa para extraer una clave única para cada elemento en la lista. En este caso, la función extrae el valor de la propiedad id del elemento y lo convierte en una cadena.
            keyExtractor={(item) => item.id.toString()}
            /*Renderiza el resultado segun su id*/
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Text style={styles.resultText}>
                {/*es una expresión ternaria que verifica si la propiedad confirmed del objeto item es verdadera o falsa. Si confirmed es verdadero, se renderiza la cadena "Confirmed", de lo contrario, se renderiza la cadena "Possible"*/}
                  {item.confirmed ? 'Confirmed' : 'Possible'} 
                  match: {item.plant_name} 
                  (Probability: {item.probability.toFixed(2)})
                </Text>
                {/* Aquí puedes agregar más detalles sobre la planta si están disponibles en item.plant_details */}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    flexDirection: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
  },
});
