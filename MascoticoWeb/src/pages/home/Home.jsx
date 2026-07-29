import React from 'react'
import Hero from './Hero'
import ChooseUs from './ChooseUs'
import Products from '../shop/Products'
import Expricences from './Expricences'
import Materials from './Materials'
import Testimonials from './Testimonials'



const Home = () => {
  return (
    <>
      <Hero />
      <ChooseUs />
      <Products headline="Producto más vendido" />
      <Expricences/>
      <Materials/>
      <Testimonials/>
    </>
  )
}

export default Home