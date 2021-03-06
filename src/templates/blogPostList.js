import React from "react"
import {Link} from "gatsby"
import styled from "styled-components"

import Layout from "../components/layout"

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
`

const PageNumberWrapper = styled.div`
  border: 1px solid #eee;
  background: ${props => props.isCurrentPage ? '#eee' : 'white'};
`

const PageNumber = styled(Link)`
  display: block;
  padding: 8px 16px;
`

export default ({ pageContext }) => (
  <Layout>
    {pageContext.posts.map(post => {
      return (
        <div key={post.node.wordpress_id}>
          <h3 dangerouslySetInnerHTML={{ __html: post.node.title }} />
          <small>
            {post.node.date}
          </small>
          <p dangerouslySetInnerHTML={{ __html: post.node.excerpt }} />
          <div>
            <Link to={`/post/${post.node.slug}`}>
              Read more...
            </Link>
          </div>
        </div>
      )
    })}

    <Pagination>
    {Array.from({ length: pageContext.numberOfPages }).map((page, index) => {
      return (
        <PageNumberWrapper key={index} isCurrentPage={index + 1 === pageContext.currentPage}>
          <PageNumber to={index === 0 ? '/blog' : `/blog/${index + 1}`}>
            {index + 1}
          </PageNumber>
        </PageNumberWrapper>
      )
    })}
    </Pagination>
  </Layout>
)
