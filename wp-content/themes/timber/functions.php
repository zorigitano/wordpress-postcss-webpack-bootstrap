<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

if ( ! class_exists( 'Timber' ) ) {
    add_action( 'admin_notices', function() {
        echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
    });

    add_filter('template_include', function( $template ) {
        return get_stylesheet_directory() . '/static/no-timber.html';
    });

    return;
}

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = array( 'templates', 'views' );

/**
 * By default, Timber does NOT autoescape values. Want to enable Twig's autoescape?
 * No prob! Just set this value to true
 */
Timber::$autoescape = false;


/**
 * We're going to configure our theme inside of a subclass of Timber\Site
 * You can move this to its own file and include here via php's include("MySite.php")
 */
class StarterSite extends Timber\Site {
    /** Add timber support. */
    public function __construct() {
        add_theme_support( 'post-formats' );
        add_theme_support( 'post-thumbnails' );
        add_theme_support( 'title-tag' );
        add_theme_support( 'menus' );
        add_theme_support( 'html5', array( 'comment-list', 'comment-form', 'search-form', 'gallery', 'caption' ) );
        add_filter( 'timber_context', array( $this, 'add_to_context' ) );
        add_filter( 'get_twig', array( $this, 'add_to_twig' ) );
        add_filter( 'body_class', array( $this, 'wp_body_classes' ) );
        add_filter( 'wp_head', array( $this, 'add_critical_css' ) );
        add_filter( 'wp_head', array( $this, 'add_css_assets' ) );
        add_filter( 'wp_head', array( $this, 'google_webfont_loader' ) );
        add_filter( 'wp_footer', array( $this, 'add_js_assets' ) );
        add_action( 'init', array( $this, 'register_post_types' ) );
        add_action( 'init', array( $this, 'register_taxonomies' ) );
        parent::__construct();
    }
    /** This is where you can register custom post types. */
    public function register_post_types() {

    }
    /** This is where you can register custom taxonomies. */
    public function register_taxonomies() {

    }

    /** This is where you add some context
     *
     * @param string $context context['this'] Being the Twig's {{ this }}.
     */
    public function add_to_context( $context ) {
        $context['foo'] = 'bar';
        $context['stuff'] = 'I am a value set in your functions.php file';
        $context['notes'] = 'These values are available everytime you call Timber::get_context();';
        $context['menu'] = new Timber\Menu();
        $context['site'] = $this;
        return $context;
    }

    /** This Would return 'foo bar!'.
     *
     * @param string $text being 'foo', then returned 'foo bar!'.
     */
    public function myfoo( $text ) {
        $text .= ' bar!';
        return $text;
    }

    /** This is where you can add your own functions to twig.
     *
     * @param string $twig get extension.
     */
    public function add_to_twig( $twig ) {
        $twig->addExtension( new Twig_Extension_StringLoader() );
        $twig->addFilter( new Twig_SimpleFilter( 'myfoo', array( $this, 'myfoo' ) ) );
        return $twig;
    }

    public function add_critical_css()
    {
        $criticalCSS = glob($_SERVER["DOCUMENT_ROOT"] . '/dist/assets/critical*.css');

        if (empty($criticalCSS) === false && file_exists($criticalCSS[0]) === true) {
            $file = file_get_contents($criticalCSS[0]);

            echo "<style type=\"text/css\">" . $file . "</style>\n";
        }
    }

    public function add_css_assets()
    {
        $css = $this->add_assets('css');

        if (!empty($css) === true) {
            foreach ($css as $file) {
                echo "<link rel=\"stylesheet\" href=\"/dist/assets/$file\" type=\"text/css\" media=\"screen\" defer/>";
            }
        }
    }

    public function add_js_assets()
    {
        $js = $this->add_assets('js');

        if (!empty($js) === true) {
            foreach ($js as $file) {
                echo "<script type=\"text/javascript\" src=\"/dist/assets/$file\"></script>";
            }
        }
    }

    public function add_assets($type)
    {
        global $post;

        $manifest = glob($_SERVER["DOCUMENT_ROOT"] . '/dist/webpack-manifest.json');

        if (file_exists($manifest[0]) === true) {
            $file = file_get_contents($manifest[0]);
            $manifestObj = json_decode($file);
            $assets = $manifestObj->assets;
            $path = explode('/', $_SERVER['REQUEST_URI'])[1];
            $entryName = $path;
            $postType = get_post_type($post);

            if (is_front_page() === true) {
                $entryName = 'home';
            }

            if ($postType === 'post' && is_single() === true) {
                $entryName = 'article';
            }

            if (property_exists($assets, $entryName) === true) {

                $assets = array_filter($assets->$entryName, function($var) use ($type) {
                    if (preg_match('/.' . $type .'$/', $var)) {
                        return $var;
                    }
                });

                return $assets;
            }
        }
    }

    function wp_body_classes($classes) {
        if( strpos( $_SERVER['HTTP_ACCEPT'], 'image/webp' ) !== false || strpos( $_SERVER['HTTP_USER_AGENT'], ' Chrome/' ) !== false ) {
            $classes[] = 'webp-supported';
        }
        return $classes;
    }

    function google_webfont_loader()
    {
        echo <<<EOT
 
            <script>
            WebFontConfig = {
                google: {
                    families: ['']
                }
            };
            (function(d) {
                var wf = d.createElement('script'), s = d.scripts[0];
                wf.src = '//ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
                wf.async = true;
                s.parentNode.insertBefore(wf, s);
            })(document);
        </script>
EOT;
    }

}

new StarterSite();
