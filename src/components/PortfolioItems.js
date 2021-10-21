import React from 'react'
import {graphql, StaticQuery, Link} from 'gatsby'
import styled from 'styled-components'

const PortfolioItemsWrapper = styled.div`
  display: flex;
  justify-content: center;

`

const PortfolioItem = styled.div`
  width: 300px;
  border: 1px solid #efefef;
  padding: 16px;
  margin: 16px;

`

const PortfolioImage = styled.img`
  max-width: 100%;
`

const PortfolioItems = () => {
  return (
    <StaticQuery query={query} render={props => 
      <PortfolioItemsWrapper>

      {props.allWordpressWpPortfolio.edges.map(item => (
      <PortfolioItem key={item.node.id}>
        <h2>{item.node.title}</h2>
        <PortfolioImage src={item.node.featured_media.source_url} alt="Thumbnail" />
        <div dangerouslySetInnerHTML={{__html: item.node.excerpt}} />
        <Link to={`/portfolio/${item.node.slug}`}>
          Read more
        </Link>
      </PortfolioItem>
    ))}
      </PortfolioItemsWrapper>
  
  } />
  )
}

const query = graphql`
  {
    allWordpressWpPortfolio {
      edges {
        node {
          id
          excerpt
          title
          slug
          featured_media {
            source_url
          }
        }
      }
    }
  }
`

export default PortfolioItems