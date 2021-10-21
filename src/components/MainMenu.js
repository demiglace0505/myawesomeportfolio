import React from "react"
import { graphql, StaticQuery, Link } from "gatsby"
import styled from "styled-components"

import SiteInfo from "./SiteInfo"

const MainMenuWrapper = styled.div`
  display: flex;
  background-color: rgb(3, 27, 77);
`

const MenuItem = styled(Link)`
  color: #ffffff;
  display: block;
  padding: 8px 16px;
`

const MainMenuInner = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  width: 960px;
  height: 100%;
`

const MainMenu = () => {
  return (
    <StaticQuery
      query={query}
      render={props => {
        return (
          <MainMenuWrapper>
            <MainMenuInner>
              <SiteInfo />
              {props.allWordpressWpApiMenusMenusItems.edges[0].node.items.map(
                item => {
                  return (
                    <MenuItem to={`/${item.object_slug}`} key={item.title}>
                      {item.title}
                    </MenuItem>
                  )
                }
              )}
            </MainMenuInner>
          </MainMenuWrapper>
        )
      }}
    />
  )
}

const query = graphql`
  {
    allWordpressWpApiMenusMenusItems(filter: { name: { eq: "Main Menu" } }) {
      edges {
        node {
          items {
            title
            object_slug
          }
        }
      }
    }
  }
`

export default MainMenu
