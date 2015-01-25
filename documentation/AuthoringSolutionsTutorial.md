## Authoring Solutions Registry Entries

This tutorial will show how to write a new solution for integration with the GPII.  Solutions could be anything from an operating system accessibility feature such as screen magnification, or a third party program such as a screenreader.  For this tutorial we will use an example that was started during the Crete HCII 2014 workshops, integrating the windows based screen reader JAWS into the GPII. This example was meant as a tutorial, and needs more work to be production ready, but serves as a good example all the different parts that are needed.

### Expressing Your Applications as a Document

Integrating your solution, application, or other utility involves authoring a document using our structured solution schema formatted as JSON. In most cases you won't need to write any javascript code, as we have a number of plugins with syntax that are available from this schema. On occasion though, you may find something that can't be accomplished with the current schema and plugins, at which point you can work with our developers on creating the necessary extensions.

The first step of this process involves thinking about what happens whenever someone uses your solution, and what happens if a different person needs to use it. For instance, your solution might be an application with an executable that must be launched, and stopped when the user is done.  And if a different user where to try it, they might need some of the settings changed which are different from the previous user.

Also, you'll want to think about what features your solution has that are useful to users in general and also specifically in the domain of accessibility.

With that in mind we'll dive in to the different sections of the solutions format, building up a complete example. The finished product is at the end of this document if you want to go down and reference it at any point. Also, a large number of examples for different platforms are available in the files in the directory `universal/testData/solutions`.

### The Starting Template

If you look at the files in `universal/testData/solutions` directory you'll see that a solutions file is a JSON object with each solution being another object keyed by the solutions unique id. For the JAWS example we'll use `com.freedomscientific.jaws` as the id. This id should be completely unique from any others, so it's useful to use the reverse domain naming system when possible.

Our starting template looks as follows:

```json
    "com.freedomscientific.jaws": {
        "name": "JAWS",
        "contexts": {},
        "settingsHandlers": [],
        "lifecycleManager": {}
    }
```

The solution are 4 sections.

* name: This is a simple human readable name for the solution. We've filled it in with JAWS.
* contexts: This specifices the context that your solution runs in, such as the operating system and any other dependencies it has.
* settingsHandlers: The settings handlers sections describes where your solution stores it's settings, such as an XML file, or the windows registry, and how to change them. It can also map these settings to common terms that are used for accessibility needs and preferences.
* lifecycleManager: Lastly, this section tells us how your solution is started and stopped, and perhaps at what point in that cycle that it's settings should be changed, updated, or reverted.

### The Contexts Section

We'll now expand upon our initial template and add in the contexts section:

```json
    "com.freedomscientific.jaws": {
        "name": "JAWS",
        "contexts": {
            "OS": [
                {
                    "id": "win32"
                }
            ]
        },
        "settingsHandlers": [],
        "lifecycleManager": {}
    }
```

Currently, the minimal needs for this section include a key `OS` that specifies an array of operating systems. In this case we are running on the `win32` platform.  You can see other options for this field in the other solutions entries.

In the future, information could also go here detailing which libraries and versions of modules you depend on, but at the moment it is quite simple.

### The Settings Handlers Section

The section keyed by `settingsHandlers` defines an array of sources where properties and settings may be saved for the application. In this case we only have one item in the array, but if you had multiple files where settings were stored, you could have multiple sections.

Lets take a look at the single settingsHandler we have:

```json
        "settingsHandlers": [
            {
                "type": "gpii.settingsHandlers.INISettingsHandler",
                "options": {
                    "filename": "${{environment}.APPDATA}\\Freedom Scientific\\JAWS\\15.0\\Settings\\VoiceProfiles.ini"
                },
                "capabilities": [
                    "applications.com\\.freedomscientific\\.jaws.id"
                ],
                "capabilitiesTransformations": {
                    "cloud4allVoiceProfile-GlobalContext\\.Punctuation": {
                        "transform": {
                            "type": "fluid.transforms.valueMapper",
                            "inputPath": "http://registry\\.gpii\\.net/common/punctuationVerbosity",
                            "options": {
                                "none": {
                                    "outputValue": 0
                                },
                                "some": {
                                    "outputValue": 1
                                },
                                "most": {
                                    "outputValue": 2
                                },
                                "all": {
                                    "outputValue": 3
                                }
                            }
                        }
                    },
                    "cloud4allVoiceProfile-GlobalContext\\.Speed": {
                        "transform": {
                            "type": "fluid.transforms.linearScale",
                            "valuePath": "http://registry\\.gpii\\.net/common/speechRate",
                            "factor": 0.125,
                            "offset": -12.125
                        }
                    }
                }
            }
        ],

```

The first item is the type, for us it's  `gpii.settingsHandlers.INISettingsHandler`, because JAWS stores it's settings in an INI file. There are other settings handlers for XML Files, using the Windows Registry, and other places across platforms.

TODO insert link to desc of other settings handler types

Next up is an `options` block of JSON. The keys that are available in here will differ depending upon which settings handler is being used. In the case of the `INISettingsHandler` we have the option `filename` that is the path to the INI file containing the settings.

The filename here has some interesting characteristics.

```json
"filename": "${{environment}.APPDATA}\\Freedom Scientific\\JAWS\\15.0\\Settings\\VoiceProfiles.ini"
```

First off, because this is in a JSON string we do have to remember about standard escape sequences, so in order to write a single backslash, you need to put 2 in a row.

Also, take a look at `${{environment}.APPDATA}`.  Inside our document processing, we support certain special variables that can be used in strings. In this case, the `environment` variable allows us to access any variable in the standard windows command line environment.  On windows `APPDATA` is a standard variable that points to a directory on the machine that contains data for various applications.  

TODO Provide full path example of what the path above resolves to when I get back to a windows machine.

TODO Point to further/future documentation that says what string variables are available in which fields

### The Finished Example

```json
    "com.freedomscientific.jaws": {
        "name": "JAWS",
        "contexts": {
            "OS": [
                {
                    "id": "win32"
                }
            ]
        },
        "settingsHandlers": [
            {
                "type": "gpii.settingsHandlers.INISettingsHandler",
                "options": {
                    "filename": "${{environment}.APPDATA}\\Freedom Scientific\\JAWS\\15.0\\Settings\\VoiceProfiles.ini"
                },
                "capabilities": [
                    "applications.com\\.freedomscientific\\.jaws.id"
                ],
                "capabilitiesTransformations": {
                    "cloud4allVoiceProfile-GlobalContext\\.Punctuation": {
                        "transform": {
                            "type": "fluid.transforms.valueMapper",
                            "inputPath": "http://registry\\.gpii\\.net/common/punctuationVerbosity",
                            "options": {
                                "none": {
                                    "outputValue": 0
                                },
                                "some": {
                                    "outputValue": 1
                                },
                                "most": {
                                    "outputValue": 2
                                },
                                "all": {
                                    "outputValue": 3
                                }
                            }
                        }
                    },
                    "cloud4allVoiceProfile-GlobalContext\\.Speed": {
                        "transform": {
                            "type": "fluid.transforms.linearScale",
                            "valuePath": "http://registry\\.gpii\\.net/common/speechRate",
                            "factor": 0.125,
                            "offset": -12.125
                        }
                    }
                }
            }
        ],
        "lifecycleManager": {
            "start": [
                "setSettings",
                {
                    "type": "gpii.launch.exec",
                    "command": "\"${{registry}.HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\JAWS15.exe\\}\""
                }
            ],
            "stop": [
                {
                    "type": "gpii.launch.exec",
                    "command": "${{environment}.SystemRoot}\\System32\\taskkill.exe /f /im jfw.exe"
                },
                "restoreSettings"
            ]
        }
    },

```

TODO Include the output of the INI file that is being modified.
