## Setting up WordPress locally

> Tools used
>
> - Local

I created my first local instance of WordPress using LocalWP. For this course, I gave it the domain **gatsby-wordpress-course**. 

## Setting up Gatsby

I installed gatsby-cli globally on my machine via npm:

```
npm install -g gatsby-cli
```

A new project can be created using

```
gatsby new myawesomeportfolio https://github.com/tomphill/gatsby-wordpress-starter
```

After installation, I made sure that the following configurations are present in the gatsby-config.js file

```jsx
plugins: [
    ...
    {
      resolve: "gatsby-source-wordpress",
      options: {
        baseUrl: "gatsby-wordpress-course.local",
        ...
        ],
      },
    },
  ],
```

The project can then be run using

```
gatsby develop
```

and visited in localhost:8000 and localhost:8000/__graphql

## Rendering Pages and Querying data

#### Querying Wordpress API using GraphiQL

To query the created Sample page, the following query can be run

```jsx
{
  allWordpressPage{
    edges{
      node{
        id
        title
        content
      }
    }
  }
}
```

#### Querying Wordpress API from within Gatsby

In the project directory under src/pages/inedx.js, I added the following:

```jsx
import {graphql, StaticQuery} from 'gatsby'

const IndexPage = () => (
  <Layout>
    <StaticQuery 
      query={graphql`
      {
        allWordpressPage{
          edges{
            node{
              id
              title
              content
            }
          }
        }
      }
    `} 
      render={props => (
      <div>
        {props.allWordpressPage.edges.map(page => (
          <div key={page.node.id}>
            <h1>{page.node.title}</h1>
            <div dangerouslySetInnerHTML={{__html: page.node.content}} />
          </div>
        ))}
      </div>
    )} />
  </Layout>
)
```

The graphql component allows us to construct a graphQL query while the StaticQuery component executes the query and passes into a render prop the data returned by the query.

#### Generating Gatsby pages dynamically from Wordpress pages & posts

I first imported the example gatsby-node.js file from [the documentation](https://github.com/gatsbyjs/gatsby/blob/1da331a5352e3f7cb18f69050b7199481d85fbcb/packages/gatsby-source-wordpress/README.md) into the local project's gatsby-node.js.

A react component called pageTemplate and postTemplate must be created under src/templates, so that the **createPage()** function of Gatsby can dynamically create the pages.

The *context* key of the **createPage()** function is then passed as a prop *pageContext* which is then used for rendering the template page.js

```jsx
import React from 'react'

export default ( {pageContext} ) => (
  <div>
    <h1>
      {pageContext.title}
    </h1>
  </div>
)
```

#### Fixing 404 not-found on root URL

We can configure gatsby such that we redirect to whatever we consider the home page. We can do this using the createRedirect API of gatsby.

```jsx
//gatsby-node.js

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions
  createRedirect({
    fromPath: '/',
    toPath: '/home',
    redirectInBrowser: true,
    isPermanent: true
  })
  ...
```

## Creating a Wordpress Menu

#### Removing the Frontend and creating the menu

We first need to remove the active theme in Wordpress. This is done by uploading [this theme](https://github.com/tomphill/wp-gatsby-js-theme-starter) to Wordpress themes. I then created and published a home and portfolio page. Afterwards, I created a Menu called Main menu.

In order to visit the menu endpoint and query it from the API, I installed a Wordpress plugin called WP API Menus *By* [Fulvio Notarstefano](https://github.com/unfulvio) 

#### Querying Wordpress menus with GraphiQL

```jsx
{
  allWordpressWpApiMenusMenusItems{
    edges{
      node{
        items{
          title
          object_slug
        }
      }
    }
  }
}
```

#### Creating the Menu component in Gatsby

```jsx
import React from 'react'
import { StaticQuery, Link } from 'gatsby'

const MainMenu = () => {
  return (
    <StaticQuery
      query={graphql`
        {
          allWordpressWpApiMenusMenusItems(filter: {
            name: {
              eq: "Main menu"
            }
          }){
            edges{
              node{
                name
                items{
                  title
                  object_slug
                }
              }
            }
          }
        }
    `}
    render={props => (
      <div>
        {props.allWordpressWpApiMenusMenusItems.edges[0].node.items.map(item => (
          <Link to={`/${item.object_slug}`} key={item.title}>
            {item.title}
          </Link>
        ))}
      </div>
    )}
    />
  )
}

export default MainMenu
```

Note that filter is used so that only *Main menu* will be returned by the query, in case there are multiple menus in the page.

#### Styling with styled-components

I first installed the necessary dependencies

```
npm install gatsby-plugin-styled-components styled-components babel-plugin-styled-components
```

layout.js was then styled:

```jsx
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
  body {
    font-family: 'Open Sans', sans-serif;
  }
`

const LayoutWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  margin: 0 !important;
  padding: 0 !important;
`

const Layout = ({ children }) => {

  return (
    <div>
      <GlobalStyles />
      <MainMenu />
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </div>
  )
}
```

And MainMenu.js was styled accordingly as well

```jsx
const MainMenuWrapper = styled.div`
  display: flex;
  background-color: rgb(3, 27, 77);
`

const MenuItem = styled(Link)`
  color: white;
  display: block;
  padding: 8px 16px;
`

const MainMenu = () => {
  return (
    <StaticQuery
      query={graphql`
        {
          allWordpressWpApiMenusMenusItems(filter: {
            name: {
              eq: "Main menu"
            }
          }){
            edges{
              node{
                name
                items{
                  title
                  object_slug
                }
              }
            }
          }
        }
    `}
    render={props => (
      <MainMenuWrapper>
        {props.allWordpressWpApiMenusMenusItems.edges[0].node.items.map(item => (
          <MenuItem to={`/${item.object_slug}`} key={item.title}>
            {item.title}
          </MenuItem>
        ))}
      </MainMenuWrapper>
    )}
    />
  )
}
```

#### Retrieving and rendering the Wordpress site title and tagline

```jsx
const SiteInfo = () => {
  return (
    <StaticQuery
      query={graphql`
      {
        allWordpressSiteMetadata{
          edges{
            node{
              name
              description
            }
          }
        }
      }
      `}
      render={props => (
        <SiteInfoWrapper>
          <SiteTitle>
            {props.allWordpressSiteMetadata.edges[0].node.name}
          </SiteTitle>
          <div>
            {props.allWordpressSiteMetadata.edges[0].node.description}
          </div>

        </SiteInfoWrapper>
      )}
    />
  )
}
```

## Creating a custom "Portfolio" post type in Wordpress

In the wordpress admin panel, go to Appearance -> Theme editor -> Theme Functions

```php
<?php
add_theme_support( 'custom-logo' );
add_theme_support( 'menus' );
add_theme_support('post-thumbnails');

function create_custom_portfolio_post_type(){
	register_post_type('portfolio', 
					  	array(
							'labels' => array(
								'name' => __('Portfolio'),
								'singular_name' => __('Portfolio')
							),
								'public' => true,
								'show_in_admin_bar' => true,
								'show_in_rest' => true
						)
					  );
	add_post_type_support('portfolio', array('thumbnail', 'excerpt'));
}

add_action('init', 'create_custom_portfolio_post_type');
```

This now allows us to access the portfolio endpoint via 

```
http://gatsby-wordpress-course.local/wp-json/wp/v2/portfolio
```

## Querying and rendering the custom "Portfolio" post types

#### Querying the custom portfolio post type with GraphQL

gatsby-config.js has to be edited to include the portfolio endpoint in the includedRoutes

```jsx
includedRoutes: [
          "**/categories",
          "**/posts",
          "**/pages",
          "**/media",
          "**/tags",
          "**/taxonomies",
          "**/users",
          "**/menus",
          "**/portfolio"
        ],
```

Now, Wordpress will generate a graphQL query for us to access the portfolio endpoint

```js
{
  allWordpressWpPortfolio{
    edges{
      node{
        title
        excerpt
        content
        featured_media{
          source_url
        }
      }
    }
  }
}
```

I then created a PortfolioItem.js component, which renders the portfolio items

```jsx
const PortfolioItems = () => {
  return (
    <StaticQuery 
      query={graphql`
      {
        allWordpressWpPortfolio{
          edges{
            node{
              id
              slug
              title
              excerpt
              content
              featured_media{
                source_url
              }
            }
          }
        }
      }
      `}
      render={props => props.allWodpressWpPortfolio.edges.map(portfolioItem => (
        <div key={portfolioItem.node.id}>
          <h2>
            {portfolioItem.node.title}
          </h2>
          <img src={portfolioItem.node.featured_media.source_url} />
          <div dangerouslySetInnerHTML={{__html: portfolioItem.node.excerpt}} />
          <Link to={`/portfolio/${portfolioItem.node.slug}`}>Read more</Link>
        </div>
      ))}
    />
  )
}
```

#### Auto-generating portfolio pages in Gatsby

At this point, the file post.js has been renamed into portfolio.js and instead of querying for all posts, we just need to query for portfolio posts. The endpoint has to be updated as well to use /portfolio instead of /post

```jsx
  graphql(
      `
        {
          allWordpressPage {
            edges {
              node {
                id
                slug
                status
                template
                title
                content
                template
              }
            }
          }
        }
      `
    )
      .then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create Page pages.
        const pageTemplate = path.resolve("./src/templates/page.js")
        // We want to create a detailed page for each
        // page node. We'll just use the WordPress Slug for the slug.
        // The Page ID is prefixed with 'PAGE_'
        _.each(result.data.allWordpressPage.edges, edge => {
          // Gatsby uses Redux to manage its internal state.
          // Plugins and sites can use functions like "createPage"
          // to interact with Gatsby.

          createPage({
            // Each page is required to have a `path` as well
            // as a template component. The `context` is
            // optional but is often necessary so the template
            // can query data specific to each page.
            path: `/${edge.node.slug}/`,
            component: slash(pageTemplate),
            context: edge.node,
          })
        })
      })
      // ==== END PAGES ====

      // ==== POSTS (WORDPRESS NATIVE AND ACF) ====
      .then(() => {
        graphql(
          `
          {
            allWordpressWpPortfolio{
              edges{
                node{
                  id
                  slug
                  title
                  excerpt
                  content
                  featured_media{
                    source_url
                  }
                }
              }
            }
          }
          `
        ).then(result => {
          if (result.errors) {
            console.log(result.errors)
            reject(result.errors)
          }
          const portfolioTemplate = path.resolve("./src/templates/portfolio.js")
          // We want to create a detailed page for each
          // post node. We'll just use the WordPress Slug for the slug.
          // The Post ID is prefixed with 'POST_'
          _.each(result.data.allWordpressWpPortfolio.edges, edge => {
            createPage({
              path: `/portfolio/${edge.node.slug}/`,
              component: slash(portfolioTemplate),
              context: edge.node,
            })
          })
          resolve()
        })
      })
```

