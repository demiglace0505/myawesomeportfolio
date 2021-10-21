import React from 'react'
import {graphql, StaticQuery} from 'gatsby'
import styled from 'styled-components'

const SiteInfoWrapper = styled.div`
  flex-grow: 1;
  color: white;
  margin: 0 auto;
`

const SiteTitle = styled.div`
  font-weight: bold;
`

const SiteInfo = () => {
  return (
    <StaticQuery query={query} render={props => (
      <SiteInfoWrapper>
        <SiteTitle>
          {props.allWordpressSiteMetadata.edges[0].node.name}
        </SiteTitle>
        <div>
          {props.allWordpressSiteMetadata.edges[0].node.description}
        </div>
      </SiteInfoWrapper>
    )} />
  )
}

const query = graphql`
  {
    allWordpressSiteMetadata {
      edges {
        node {
          name
          description
        }
      }
    }
  }
`

export default SiteInfo