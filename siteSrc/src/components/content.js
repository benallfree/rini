import React from "react"

import { COLORS } from "../styles/constants"

const Content = () => (
  <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
    <content
      style={{
        display: "grid",
        alignItems: "center",
        justifyContent: "center",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 340px))",
      }}
    >
      <div>
        <h3>Oh, the fun we'll have saying hi</h3>
        <p>
          As you drive around, Rini will gently notify you when other Tesla
          drivers running Rini are nearby. Obviously, they want to play.
        </p>
      </div>
      <div>
        <h3>Like Pokémon Go, but for us!</h3>
        <p>
          Includes plugins for analytics, building sitemaps, and optimizing
          images
        </p>
      </div>
    </content>
  </div>
)

export default Content
