#pragma once

#include <string>

std::string Transcribe(const std::string& model_path, const float* audio_data, size_t audio_data_size);