import { prisma } from "./prisma"

export async function getCities() {
  return await prisma.city.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getCityById(id: string) {
  return await prisma.city.findUnique({
    where: { id }
  })
}

export async function getCityByName(name: string) {
  return await prisma.city.findUnique({
    where: { name }
  })
}

export async function getDeliveryFee(cityName: string) {
  const city = await prisma.city.findUnique({
    where: { name: cityName }
  })
  
  // Default fee if city is not found
  return city?.deliveryFee ?? 10.0
}

export async function addCity(name: string, deliveryFee: number) {
  return await prisma.city.create({
    data: {
      name,
      deliveryFee
    }
  })
}

export async function updateCity(id: string, data: { name?: string, deliveryFee?: number }) {
  return await prisma.city.update({
    where: { id },
    data
  })
}

export async function deleteCity(id: string) {
  return await prisma.city.delete({
    where: { id }
  })
} 