# Configuration file for jupyter-notebook.

## The IP address the notebook server will listen on.
c.NotebookApp.ip = '*'

## The directory to use for notebooks and kernels.
c.NotebookApp.notebook_dir = 'data/JupyterNB'

## Whether to open in a browser after starting. The specific browser used is
#  platform dependent and determined by the python standard library `webbrowser`
#  module, unless it is overridden using the --browser (NotebookApp.browser)
#  configuration option.
c.NotebookApp.open_browser = False

## Hashed password to use for web authentication.
#  
#  To generate, type in a python/IPython shell:
#  
#    from notebook.auth import passwd; passwd()
#  
#  The string should be of the form type:salt:hashed-password.
# c.NotebookApp.password = 'sha1:17942514a98b:4705f39ebc44b6a791d33ab80ca1f4e47ff873ec'

## The port the notebook server will listen etn.
c.NotebookApp.port = 8888

# Embedding the notebook in another website
# Sometimes you may want to embed the notebook somewhere on your website, e.g. in an IFrame. To do this, you may need to override the Content-Security-Policy to allow embedding. Assuming your website is at https://mywebsite.example.com, you can embed the notebook on your website with the following configuration setting in jupyter_notebook_config.py:

# c.NotebookApp.tornado_settings = {
#     'headers': {
#         'Content-Security-Policy': "frame-ancestors https://mywebsite.example.com 'self' "
#     }
# }
# When embedding the notebook in a website using an iframe, consider putting the notebook in single-tab mode. Since the notebook opens some links in new tabs by default, single-tab mode keeps the notebook from opening additional tabs. Adding the following to ~/.jupyter/custom/custom.js will enable single-tab mode:

# define(['base/js/namespace'], function(Jupyter){
#     Jupyter._target = '_self';
# });,

c.NotebookApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors * 'self' "
    }
}

