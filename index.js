const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// const mongooes = require("mongoose");
// mongooes.set("strictQuery", false);
// mongooes
//   .connect(
//     "mongodb+srv://nil:123456789Com@nodeapi.nfsdvq5.mongodb.net/nodeAPI",
//     {
//       useNewUrlParser: true,
//     }
//   )
//   .then(() => {
//     console.log("DB Connection....done");
//   })
//   .catch((error) => {
//     console.log(error);
//   });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const topic_const = {
  topic_new: process.env.TOPIC_NAME_NEW,
  topic_general: process.env.TOPIC_NAME_GENERAL,
  topic_medrefill: process.env.TOPIC_NAME_MED,
  topic_ins: process.env.TOPIC_NAME_INS,
  topic_schedule: process.env.TOPIC_NAME_SCHEDULE,
  topic_bill: process.env.TOPIC_NAME_BILL,
  topic_pr_vg: process.env.TOPIC_NAME_PR_VG,
};
const appConfDID = {
  main: "1234567",
  ins: "1234568",
};
const nodes = [
  {
    index: 0,
    message:
      "Welcome to the chatbot! Please select an option:" +
      "<br>1️⃣ Start texting" +
      "<br>2️⃣ New patients" +
      "<br>3️⃣ Phone call" +
      "<br>4️⃣ Med refill" +
      "<br>5️⃣ Insurance" +
      "<br>6️⃣ Scheduling" +
      "<br>7️⃣ Billing" +
      '<br>To stop the messages, type "STOP"',
    children: {
      1: 3, // Go to node 3 for "Start texting"
      2: 2, // Go to node 2 for "New patients"
      3: 1, // Go to node 1 for "Phone call"
      4: 4, // Go to node 4 for "Med refill"
      5: 5, // Go to node 5 for "Insurance"
      6: 6, // Go to node 6 for "Scheduling"
      7: 7, // Go to node 7 for "Billing"
    },
    initialize: true,
  },
  {
    index: 1,
    message:
      'You selected "Phone call".<br /> Please provide more details or type "MENU" to go back to the main menu.',
    children: {
      0: 0, // Go back to the main menu
    },
    loopback: true,
  },
  {
    index: 2,
    message:
      'You selected "New patients". <br /> How can I assist you with new patient inquiries?',
    children: {
      0: 0, // Go back to the main menu
      1: 1, // Go to node 1 for "Phone call" (if needed)
    },
    bot_data: {
      supportType: topic_const.topic_new, // Specify the topic
    },
    acceptAll: true,
  },
  {
    index: 3,
    message: "message",
    children: {
      0: 0,
      1: 1, // Go to node 1 for call option
    },
    bot_data: {
      supportType: topic_const.topic_general,
    },
    acceptAll: true,
  },
  {
    index: 4,
    message: "message",
    children: {
      0: 0,
      1: 1, // Go to node 1 for call option
    },
    bot_data: {
      supportType: topic_const.topic_medrefill,
    },
    acceptAll: true,
  },
  {
    index: 5,
    message: "message",
    children: {
      0: 0,
      1: 10, // Go to node 10 for call option
    },
    bot_data: {
      supportType: topic_const.topic_ins,
    },
    acceptAll: true,
  },
  {
    index: 6,
    message: "message",
    children: {
      0: 0,
      1: 9, // Go to node 9 for appointment option
      2: 1, // Go to node 1 for call option
    },
    bot_data: {
      supportType: null,
    },
  },
  {
    index: 7,
    message: "message",
    children: {
      0: 0,
      1: 1, // Go to node 1 for call option
    },
    bot_data: {
      supportType: topic_const.topic_bill,
    },
    acceptAll: true,
  },
  {
    // 6-1
    index: 9,
    message: "message",
    children: {
      0: 0,
    },
    bot_data: {
      supportType: topic_const.topic_schedule,
    },
  },
  {
    // 5-1
    index: 10,
    message: "message",
    call: appConfDID.ins,
    children: {
      0: 0,
    },
    loopback: true,
  },
  {
    // isolated node for now
    index: 11,
    message: "message",
    children: {
      0: 0,
    },
    bot_data: {
      supportType: topic_const.topic_pr_vg,
    },
  },
];
app.get("/", (req, res) => {
  res.render("index", { message: nodes[0].message });
});
app.post("/chat", (req, res) => {
  const userMessage = req.body.message;
  let currentNodeIndex = req.body.currentNodeIndex || 0;
  function getNextNodeIndex(userMessage, currentNodeIndex) {
    if (currentNodeIndex === 8) {
      let responseMessage = "";

      if (userMessage.toUpperCase() === "MENU") {
        return 0;
      } else if (userMessage.toUpperCase() === "STOP") {
        return -1;
      } else {
        responseMessage = `You entered: "${userMessage}"`;
        return 0;
      }
    } else {
      const selectedOption = parseInt(userMessage);
      const nextNode = nodes[currentNodeIndex].children[selectedOption];
      if (nextNode !== undefined) {
        return nextNode;
      } else {
        return currentNodeIndex;
      }
    }
  }
  currentNodeIndex = getNextNodeIndex(userMessage, currentNodeIndex);
  const chatbotResponse = nodes[currentNodeIndex].message;
  res.json({ response: chatbotResponse, currentNodeIndex });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
