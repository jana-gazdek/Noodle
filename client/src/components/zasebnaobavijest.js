import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Zasebnaobavijest = () => {
  const { linkTekst } = useParams();
  const [obavijest, setObavijest] = useState({});
  
  
};

export default Zasebnaobavijest;