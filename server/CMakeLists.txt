cmake_minimum_required(VERSION 3.20)

project(lote-node-addon)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_OSX_DEPLOYMENT_TARGET 12.0)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../third_party/whisper.cpp whisper)

set(HEADERS
    include/lote.hpp
)

set(SOURCES
    src/lote.cpp
)

set(TARGET_COMPILE_OPTIONS)
set(TARGET_LINK_LIBRARIES_LIBRARIES)

if (APPLE)
    list(APPEND TARGET_COMPILE_OPTIONS -fobjc-arc)
endif()

add_library(lote ${HEADERS} ${SOURCES})
target_include_directories(lote PUBLIC include)
target_link_libraries(lote PUBLIC whisper ${TARGET_LINK_LIBRARIES_LIBRARIES})

add_library(lote-node-addon SHARED src/module.cpp)
target_include_directories(lote-node-addon PUBLIC  ${CMAKE_JS_INC})
target_link_libraries(lote-node-addon PUBLIC lote)
target_compile_definitions(lote-node-addon PUBLIC NAPI_VERSION=9 NODE_ADDON_API_CPP_EXCEPTIONS NODE_ADDON_API_CPP_EXCEPTIONS_ALL)
target_link_libraries(lote-node-addon PUBLIC ${CMAKE_JS_LIB})
set_target_properties(lote-node-addon PROPERTIES OUTPUT_NAME "lote")
set_target_properties(lote-node-addon PROPERTIES PREFIX "")
set_target_properties(lote-node-addon PROPERTIES SUFFIX ".node")

add_custom_command(TARGET lote-node-addon POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:lote-node-addon> "${CMAKE_CURRENT_SOURCE_DIR}/bin/$<TARGET_FILE_NAME:lote-node-addon>"
)