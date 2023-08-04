const express = require("express");
const bcrypt = require('bcrypt');

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();

const admin = require("firebase-admin");


app.use(express.json());

async function main(response) {
  const allPlaces = await prisma.place.findMany();
  response.setHeader("Content-Type", "application/json");
  response.json(allPlaces);
}

app.get("/api/recommendations", (request, response) => {
  getPlacesWithHighestSumOfReviewNotes()
    .then((places) => response.json(places))
    .catch((error) => console.log(error));
});

app.get("/api/parprovinces", (request, response) => {
  getOneRandomPlaceFromEachProvince()
    .then((places) => response.json(places))
    .catch((error) => console.log(error));
});

async function getPlacesWithHighestSumOfReviewNotes() {
  try {
    const placesWithReviewSum = await prisma.place.findMany({
      include: {
        categorie: true,
        province: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        reviews: true,
        images: true,
        videos: true,
      }
    });

    let placesWithSum = placesWithReviewSum.map((place) => ({
      ...place,
      totalReviewScore: place.reviews.reduce(
        (acc, review) => acc + review.note,
        0
      ),
    }));

    placesWithSum = placesWithSum.map((place) => ({
      ...place,
      tags: place.tags.map((tag) => ({
        id: tag.tag.id,
        name: tag.tag.name,
      })),
    }))

    placesWithSum.sort((a, b) => b.totalReviewScore - a.totalReviewScore);

    const top10Places = placesWithSum.slice(0, 10);

    return top10Places;
  } catch (error) {
    console.error(error);
    throw new Error(
      "Failed to fetch places with the highest sum of review notes"
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function getOneRandomPlaceFromEachProvince() {
  try {
    const provinces = await prisma.province.findMany();
    const places = [];

    for (const province of provinces) {
      const placesInProvince = await prisma.place.findMany({
        where: { provinceId: province.id },
        include: {
          categorie: true,
          province: true,
          tags: {
            include: {
              tag: true
            }
          },
          reviews: true,
          images: true,
          videos: true,
        }
      });

      if (placesInProvince.length > 0) {
        const randomIndex = Math.floor(Math.random() * placesInProvince.length);
        places.push(placesInProvince[randomIndex]);
      }
    }

    return places;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch one random place from each province');
  } finally {
    await prisma.$disconnect();
  }
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
      where: { email },
  });

  if (!user) {
      throw new Error('User not found');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
      throw new Error('Invalid password');
  }

  const userReturn = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    profile: user.profile,
  };

  const response = {
    success: true,
    message: 'Login successful',
    data: userReturn,
  };

  return response;
}

async function signup(name, first_name, email, password) {
  const fullName = name + ' ' + first_name;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
      throw new Error('Email already exists');
  }

  try {
    const username = generateUsername(name, first_name);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { 
        name: fullName.trim(),
        username: username,
        email: email,
        password: hashedPassword,
        profile: ''
      },
    });

    const userReturn = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      profile: newUser.profile,
    };

    const response = {
      success: true,
      message: 'Sign-up successful',
      data: userReturn,
    };
  
    return response;

  } catch (error) {
    console.error(error);
    throw new Error('An error occurred');
  }
}

function generateUsername(name, firstName) {
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${name.toLowerCase()}_${firstName.toLowerCase().replace(/\s+/g, '')}${randomSuffix}`;
}


app.post("/api/login", (request, response) => {
  const { email, password }  = request.body;
  login(email, password)
  .then((resp) => response.json(resp))
  .catch((error) => response.status(401).json({ success: false, message: error.message }));
});

app.post("/api/signup", (request, response) => {
  const { name, first_name, email, password }  = request.body;
  signup(name, first_name, email, password)
    .then((resp) => response.json(resp))
    .catch((error) => response.status(400).json({ success: false, message: error.message }));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   projectId: 'tourism-m1'
// });

// const registrationToken = 'efeoTw2OQumAqT_QXdv6L9:APA91bEv1u_BSgpyqLiAT4_k-_1m6UQX-oedZ1j2ePjCLowWncHyE2Ug9V_bEb5QeCuU-0C8rAUbnX1ZCSKchNWkWlG0Yhz2a84RNwEIOKJilFPCrGx7kyjafUOmoRdrO4mPev8xVEOU';

// const message = {
//   notification: {
//     title: 'Bienvenu!',
//     body: 'Notification from Node'
//   },
//   token: registrationToken
// };

// admin.messaging().send(message)
//   .then((response) => {
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//   });
