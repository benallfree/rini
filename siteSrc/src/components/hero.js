import React from "react"
import PropTypes from "prop-types"

import Button from "../components/button"
import headerImage from "../images/header.png"
import MockupContent from "./image"
import mockupFrame from "../images/mockup-frame.png"

const Header = ({ siteTitle }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      padding: "4rem 1rem",
    }}
  >
    <div
      style={{
        backgroundImage: `url(${headerImage})`,
        position: "absolute",
        top: 0,
        zIndex: -5,
        height: "100vh",
        width: "100vw",
        opacity: 0.5,
      }}
    />
    <h3 style={{ textAlign: "center" }}>
      Salut. ¿Qué tal? Zdravstvuyte. Nǐ hǎo. Ciao. Hallo. Oi. Anyoung. Ahlan.
      Halløj. Habari. Witaj. Yā, Yō. Hello.
    </h3>
    <h1 style={{ textAlign: "center" }}>Say Hi.</h1>
    <p style={{ textAlign: "center", maxWidth: 440 }}>
      Rini is the way to say hi to other Tesla drivers. I miss those days in my
      Jeep. Everyone gets a totally unique avatar, too. Rini will notify you
      when other Tesla drivers are around and want to play.
    </p>
    <Button
      onClick={() =>
        (window.location = "https://apps.apple.com/us/app/rini/id1550533577")
      }
    >
      Rini for iOS
    </Button>
    <div style={{ margin: 60, width: `250px`, position: "relative" }}>
      <div style={{ clipPath: "inset(2% 5% round 2% 5%)" }}>
        <MockupContent />
      </div>
      <div
        style={{
          position: "absolute",
          width: "250px",
          top: 0,
        }}
      >
        <img
          src={mockupFrame}
          alt="outlines of shapes and confetti in the background "
        />
      </div>
    </div>
  </div>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
