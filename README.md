# Gatsby Wordpress Course

#### Setup

The starter template used is

```
gatsby new myawesomeportfolio https://github.com/tomphill/gatsby-wordpress-starter
```

The preconfigured gatsby-source-wordpress plugin has the following endpoints out of the box:

```jsx
        includedRoutes: [
          "**/categories",
          "**/posts",
          "**/pages",
          "**/media",
          "**/tags",
          "**/taxonomies",
          "**/users",
          "**/menus"
        ],
```

I made sure that the following configurations are also present in gatsby-config:

```js
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

#### Creating pages programatically

We can create pages programatically using the following gatsby-node configuration:

```jsx
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against the local WordPress graphql schema. Think of
    // it like the site has a built-in database constructed
    // from the fetched data that you can run queries against.
 
    // ==== PAGES (WORDPRESS NATIVE) ====
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
              allWordpressPost {
                edges{
                  node{
                    id
                    title
                    slug
                    excerpt
                    content
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
          const postTemplate = path.resolve("./src/templates/post.js")
          // We want to create a detailed page for each
          // post node. We'll just use the WordPress Slug for the slug.
          // The Post ID is prefixed with 'POST_'
          _.each(result.data.allWordpressPost.edges, edge => {
            createPage({
              path: `/post/${edge.node.slug}/`,
              component: slash(postTemplate),
              context: edge.node,
            })
          })
          resolve()
        })
      })
    // ==== END POSTS ====
  })
}
```

We also setup a redirect to `/home`

```jsx
  const { createPage, createRedirect } = actions
  createRedirect({fromPath: '/', toPath: '/home', isPermanent: true, redirectInBrowser: true})
```

#### Creating Wordpress Menu

After creating a menu in Wordpress, we made use of the plugin **WP API Menus** by Fulvio Notarstefano for querying a Wordpress menu endpoint which is located at `wp-json/wp-api-menus/v2/menus/`. We also need to include this in the **includedRoutes** property of gatsby-source-wordpress in our gatsby-config. It can then be queried via graphQL

```jsx
query MyQuery {
  allWordpressWpApiMenusMenusItems {
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
```



#### Site Tagline

We can change the site tagline by going to the Wordpress admin dashboard, Appearance -> customize. This can be queried with

```jsx
query MyQuery {
  allWordpressSiteMetadata {
    edges {
      node {
        name
        description
      }
    }
  }
}
```



#### Wordpress Custom Post type

In this section, we created a custom post type for portfolio posts. This custom post type will be displayed on the left sidebar of the admin dashboard. We can do this by editing the theme's *functions.php*. The file can be found in `\app\public\wp-content\themes\wp-gatsby-js-theme-starter-master`.

We use the built in function **register_post_type()** which takes two arguments. The first will be the name of the post type, and the second is an array of options that we can pass in when registering a post type.

```php+HTML
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

We then add support to custom post types using **add_post_type_support** wherein we allow adding of a thumbnail and an excerpt to our custom portfolio post type. Finally we add to wordpress by hooking the function into the init function.

This now allows us to access the portfolio posts via the endpoint

```
http://gatsby-wordpress-course.local/wp-json/wp/v2/portfolio
```



#### Querying Custom Post Types with GraphQL

We first add the new endpoint (portfolio) to our includedRoutes in gatsby-config

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

Once we added portfolio tot he includedRoutes, we can now query it using GraphQL

```jsx
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
```

#### Auto-generating the custom portfolio pages in Gatsby

At this point, we refactor our code. Instead of querying for posts, we query for portfolio post types. In gatsby-node.js, we use the graphql query allWordpressWpPortfolio, and then instead of using *post.js* as our template, we make use of *portfolio.js*. Likewise, the node endpoint has to be updated to `/portfolio`.

```js
      .then(() => {
        graphql(
          `
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

#### Creating a custom page template in Wordpress to conditionally render Portfolio Items

We don't want our PortfolioItems component to render in every page. We can set up a custom page template in Wordpress so that we can check if a page is using a specific template. We create a template called **portfolio_under_content.php** in 

`\gatsby-wordpress-course\app\public\wp-content\themes\wp-gatsby-js-theme-starter-master`

```php
<?php /* Template name: Portfolio items below content */ ?>
```

We can now see this Template when editing our Wordpress page. We then proceed on conditionally rendering the portfolio items using the template **portfolioUnderContent.js**

```js
        const pageTemplate = path.resolve("./src/templates/page.js")
        const portfolioUnderContentTemplate = path.resolve("./src/templates/portfolioUnderContent.js")
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
            component: slash( edge.node.template === 'portfolio_under_content.php' ? portfolioUnderContentTemplate : pageTemplate),
            context: edge.node,
          })
        })
      })
```

#### Adding ACF

Advanced Custom Fields allows us to setup custom fields to show up in our posts. We installed 2 plugins for this: **Advanced Custom FIelds** and **ACF to REST API**. This will allow us to query the ACF fields at the acf endpoint. 

```jsx
query MyQuery {
  allWordpressWpPortfolio {
    edges {
      node {
        acf {
          portfolio_url
        }
      }
    }
  }
}
```

#### Adding Pagination

We first set up our gatsby-node to query retrieve blog posts. We add the following to our promise chain in the gatsby-node.js file.

```js
      // ==== BLOG POSTS ====
      .then(() => {
        graphql(`
        allWordpressPost {
          edges {
            node {
              title
              content
              excerpt
              wordpress_id
              date(formatString: "Do MMM YYYY hh:mm")
            }
          }
        }
        `).then(result => {
          if (result.errors) {
            console.log(result.errors)
            reject(result.errors)
          }
          // PAGINATION LOGIC

          resolve()
        })
      })
```

To render the correct number of pages, we use **Math.ceil()** method. We then create an array with a length based on this number of pages. We call the **createPage()** method in a forEach loop, and in it we specify the path and the context. For the context, we will not be passing the whole posts object, instead we will only be passing the posts corresponding to the current page. Aside from this, we also pass the total number of pages, the number of the current page (which will be useful in the next section to be able to style the page number of the current page), and finally, the template for the component.

```jsx
          // PAGINATION LOGIC
          const posts = result.data.allWordpressPost.edges
          const postsPerPage = 2
          const numberOfPages = Math.ceil(posts.length / postsPerPage)
          const blogPostListTemplate = path.resolve('./src/templates/blogPostList.js')

          Array.from({ length: numberOfPages }).forEach((page, index) => {
            createPage({
              component: slash(blogPostListTemplate),
              path: index === 0 ? `/blog` : `/blog/${index + 1}`,
              context: {
                posts: posts.slice(
                  index * postsPerPage,
                  index * postsPerPage + postsPerPage
                ),
                numberOfPages,
                currentPage: index + 1,
              },
            })
          })
```

To render the navigation buttons, we use the same method as above.

```jsx
    {Array.from({ length: pageContext.numberOfPages }).map((page, index) => {
      return (
        <div key={index}>
          <Link to={index === 0 ? '/blog' : `/blog/${index + 1}`}>
            {index + 1}
          </Link>
        </div>
      )
    })}
```

To style the current page number, we can pass a prop in our styled component to check if the index is equal to the currentPage that we received from the previous section.

```jsx
const PageNumberWrapper = styled.div`
  border: 1px solid #eee;
  background: ${props => props.isCurrentPage ? '#eee' : 'white'};
`

<PageNumberWrapper key={index} isCurrentPage={index + 1 === pageContext.currentPage}>
```

To add the Blogs to our header, we go to the admin dashboard and under Menus, we add a Custom Link to `/blog`.

To create the blog posts, we loop through the array of pages from the previous section. We can use **lodash _.each** to achieve this.

```jsx
          const pageTemplate = path.resolve("./src/templates/page.js")
          _.each(posts, (post) => {
            createPage({
              path: `/post/${post.node.slug}`,
              component: slash(pageTemplate),
              context: post.node
            })
          })
```

#### Wordpress Deployment

I used Digital Ocean's one click wordpress Droplet on Ubuntu 20.04

I then setup the DNS A records to point to the ipv4 address of the Digital Ocean droplet.

```
@
A
128.199.182.220

www
A
128.199.182.220

wp
A
128.199.182.220
```

A good practice is to ping the subdomain to know if the DNS has resolved and already propagated over the internet.

```
ping wp.demiglace.xyz
```

I then SSHed into the Digital Ocean Droplet to set up the one click Wordpress installation. I enable LetsEncrypt SSL for wp.demiglace.xyz and also enabled redirecting HTTP to HTTPS.

To migrate the local wordpress. We used the plugin All-in-One Migration tool. We need to first setup directory and file permissions to enable FTP. We run the following commands via SSH:

```
chown -R www-data:www-data /var/www
find /var/www -type d -exec chmod 755 {} \;
find /var/www -type f -exec chmod 644 {} \;
```

Out of the box, Wordpress has a 16MB file size limit. To increase the maximum upload file size in WordPress, we can update `.htaccess`

```
php_value upload_max_filesize 128M
php_value post_max_size 128M
php_value memory_limit 256M
php_value max_execution_time 300
php_value max_input_time 300
```

We also need to update `wp-config.php`

```
@ini_set('upload_max_filesize', '128M');
@ini_set('post_max_size', '128M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '300');
@init_set('max_input_time', '300');
```

We can find the above 2 files in 

```
cd /var/www/html
```

Once this is done, we are now able to upload files larger than 16MB, in this case, we set the max to 128MB.

#### Uploading to Netlify

We update gatsby-config's gatsby-source-wordpress to make use of the live Wordpress URL. Instead of hardcoding values, we can make use of environment variables for this. In Netlify, we configure the following variables, for `API_URL`:

```
wp.demiglace.xyz
```

and for `API_PROTOCOL`

```
https
```

In the local gatsby-config,

```js
      resolve: "gatsby-source-wordpress",
      options: {
        baseUrl: process.env.API_URL,
        protocol: process.env.API_PROTOCOL,
```

The following are the values for the local .env file

```
API_URL=gatsby-wordpress-course.local
API_POROTOCOL=http
```

We also need to install the plugin `gatsby-plugin-netlify` and add it to gatsby-config.

Before uploading to Netlify, we first need to push our code into an online repository. We need to configure such that a deploy is made everytime a change is made to master. The build command will be

```
gatsby build
```

and the publish directory

```
public
```

#### Automatic Deployments

We can set up automatic deployments so that whenever a change is made in our Wordpress backend, a new build of the frontend will be made. For this, we used the Wordpress plugin JAMstack Deployments by Christopher Geary.

In this plugin, we need to configure the build hook, and badges which we can obtain from Netlify. The Hook method is POST.

