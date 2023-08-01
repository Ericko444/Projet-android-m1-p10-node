const express = require("express");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();

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
      select: {
        id: true,
        title: true,
        desc: true,
        provinceId: true,
        categorieId: true,
        latitude: true,
        longitude: true,
        reviews: {
          select: {
            note: true,
          },
        },
      },
    });

    const placesWithSum = placesWithReviewSum.map((place) => ({
      id: place.id,
      title: place.title,
      desc: place.desc,
      provinceId: place.provinceId,
      categorieId: place.categorieId,
      latitude: place.latitude,
      longitude: place.longitude,
      totalReviewScore: place.reviews.reduce(
        (acc, review) => acc + review.note,
        0
      ),
    }));

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
getOneRandomPlaceFromEachProvince()
  .then((places) => console.log(places))
  .catch((error) => console.error(error));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
