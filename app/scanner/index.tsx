import { Camera, CameraView } from "expo-camera";
import { Stack } from "expo-router";
import {
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Button,
} from "react-native";
import { Overlay } from "./Overlay";
import { useEffect, useRef, useState } from "react";
import axios from "axios";


const processQRCodeData = (data: string) =>{
  const dataParts = data.split(';');
  const person = {
    id_pessoa: dataParts[0].split(':')[1],
    nome: dataParts[1].split(':')[1],
    departamento: dataParts[2].split(':')[1]
  };
  return person
}

const styles = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    fontSize: 30
  },
  text: {
    color: "#F15E0A",
    fontSize: 23
  }
});


export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [scannedData, setScannedData] = useState(null);

  const handleBarcodeScanned = ({ data }) =>{
    if (data && !qrLock.current){
      qrLock.current = true;
      const person = processQRCodeData(data)
      setScannedData(person);
    }
  };

  const handleCadastrar = async () => {
    if (scannedData) {
      try {
        const response = await axios.post('https://douglasdev.com.br/semanaFisica/register', scannedData);
        alert(response.data.message); // Mostra a mensagem de sucesso ou erro retornada pelo backend
      } catch (error) {
        alert('Erro ao cadastrar.');
        console.error('Erro no cadastro:', error.toJSON());
      }
    }
  };
  const handlePresenca = async () => {
    if (scannedData) {
      try {
        const response = await axios.post('https://douglasdev.com.br/semanaFisica/attendance', { id_pessoa: scannedData.id_pessoa });
        alert(response.data.message); // Mostra a mensagem de sucesso ou erro retornada pelo backend
      } catch (error) {
        alert('Erro ao registrar presença.');
        console.error('Erro ao registrar presença:', error.toJSON());
      }
    }
  };


  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <Stack.Screen options={{ title: "Overview", headerShown: false}} />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        />
      {scannedData && (
        <View style={styles.buttonContainer}>
          <Text style={styles.text}> Escaneie o QRCode </Text>
          <Text style={styles.text}> Nome: {scannedData.Nome} </Text>
          <Button title="Cadastrar" onPress={()=>{handleCadastrar()}} />
          <Button title="Marcar Presença" onPress={()=>{handlePresenca()}} />
        </View>
      )}
        <Overlay />
    </SafeAreaView>
  );
}