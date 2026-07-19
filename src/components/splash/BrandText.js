import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BrandText(){

    return(

        <View>

            <Text style={styles.title}>
                HomeOrbit
            </Text>

            <Text style={styles.subtitle}>
                Manage. Collect. Elevate.
            </Text>

        </View>

    );

}

const styles=StyleSheet.create({

title:{

fontSize:40,

fontWeight:"700",

textAlign:"center",

color:"#082247"

},

subtitle:{

marginTop:8,

fontSize:16,

textAlign:"center",

color:"#7A8799"

}

});