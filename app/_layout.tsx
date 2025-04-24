// import {Stack} from 'expo-router'
// import {StatusBar} from 'expo-status-bar';

// export default function RootLayout(){
//  return (
//   <>
//   <StatusBar style='light'/>
//   <Stack screenOptions ={{
//     headerShown: false,
//     contentStyle:{backgroundColor:'white'},
//     animation:'slide_from_right',
//     header: () => null,
//     navigationBarHidden:true
//   }} >

//     <Stack.Screen name="index" options={{ headerShown: false}} />
//     <Stack.Screen
//           name="medications/add"
//           options={{
//             headerShown: false,
//             headerBackTitle: "",
//             title: "",
//           }}
//         />
   

//   </Stack>
//   </>
//  )
  
// }
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "@/utils/notifications";

export default function RootLayout() {
  useEffect(() => {
    const setupPushNotifications = async () => {
      await registerForPushNotificationsAsync();
    };

    setupPushNotifications();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right",
          header: () => null,
          navigationBarHidden: true,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="medications/add"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="refills/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="calendar/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="history/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
      </Stack>
    </>
  );
}
