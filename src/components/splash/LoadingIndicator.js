import React from "react";
import {ActivityIndicator} from "react-native";

export default function LoadingIndicator(){

    return(

        <ActivityIndicator
  size="large"
  color="#00CFFF"
  style={styles.spinner}


        />

    );

}