import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import Gallery from "react-photo-gallery";
import { GET_PUBLIC_PICTURE_QUERY } from "../util/graphql";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Home() {
  const [pics, setPics] = useState([]);
  const { loading, data, error } = useQuery(GET_PUBLIC_PICTURE_QUERY);
  useEffect(() => {
    if (data) {
      setPics(
        data.getPublicPictures.map((pic) => ({
          src: pic.src,
          width: getRandomInt(3, 4),
          height: getRandomInt(2, 3),
        }))
      );
    }
  }, [data]);

  if (error) {
    return <p>Error</p>;
  }
  if (loading) {
    return (
      <div class="ui segement">
        <div class="ui active inverted dimmer">
          <div class="ui huge text loader">Loading</div>
        </div>
        <p></p>
      </div>
    );
  }
  if (data) {
    return <Gallery photos={pics} />;
  }
}

export default Home;
