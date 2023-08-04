const express = require("express");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();

const admin = require("firebase-admin");


app.use(express.json());

async function createData() {
  // const newPlace = await prisma.user.create({
  //   data: {
  //     username: 'Marc',
  //     name: 'Marc',
  //     email: 'mqrc@gmail.com',
  //     password: 'fksdijfafs',
  //     profile: ''
  //   }
  // });
  // const newReview = await prisma.review.create({
  //   data: {
  //     userId: 1,
  //     placeId: 2,
  //     note: 5,
  //     comment: ''
  //   }
  // });
}

// createData()

async function main(response) {
  const allPlaces = await prisma.place.findMany();
  response.setHeader("Content-Type", "application/json");
  response.json(allPlaces);
}

app.get("/api/recommendations", (request, response) => {
  // main(response)
  //   .then(async () => {
  //     await prisma.$disconnect();
  //   })
  //   .catch(async (e) => {
  //     console.error(e);
  //     await prisma.$disconnect();
  //     process.exit(1);
  //   });
  getPlacesWithHighestSumOfReviewNotes()
    .then((places) => response.json(places))
    .catch((error) => console.log(error));
});

app.get("/api/parprovinces", (request, response) => {
  // main(response)
  //   .then(async () => {
  //     await prisma.$disconnect();
  //   })
  //   .catch(async (e) => {
  //     console.error(e);
  //     await prisma.$disconnect();
  //     process.exit(1);
  //   });
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

// Example usage:
// getOneRandomPlaceFromEachProvince()
//   .then((places) => console.log(places))
//   .catch((error) => console.error(error));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'tourism-m1'
});

const registrationToken = 'efeoTw2OQumAqT_QXdv6L9:APA91bEv1u_BSgpyqLiAT4_k-_1m6UQX-oedZ1j2ePjCLowWncHyE2Ug9V_bEb5QeCuU-0C8rAUbnX1ZCSKchNWkWlG0Yhz2a84RNwEIOKJilFPCrGx7kyjafUOmoRdrO4mPev8xVEOU';

const message = {
  notification: {
    title: 'Bienvenu!',
    body: 'Notification from Node'
  },
  token: registrationToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
